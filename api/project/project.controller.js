var ProjectUser = require("../project_user/project_user.model.js");
var Project = require("./project.model.js");
var User = require("../user/user.model.js");
var { deleteImagesFromS3 } = require("../../utils/deleteImagesFromAws.js");

//create project
function createProject(req, res) {
 var projectDetails = req.body;
 if (projectDetails.members) {
  projectDetails.members = JSON.parse(projectDetails.members);
 }

 projectDetails.createdBy = {};
 projectDetails.companyDetails = {};

 //add user and company details
 projectDetails.createdBy._id = req.user._id;
 projectDetails.createdBy.firstname = req.user.firstname;
 projectDetails.createdBy.lastname = req.user.lastname;
 projectDetails.createdBy.email = req.user.email;
 projectDetails.logo = req.files["logo"][0].location;
 projectDetails.companyDetails._id = req.company._id;
 projectDetails.companyDetails.name = req.company.name;
 projectDetails.companyDetails.domain = req.company.domain;

 console.log("projectDetails", projectDetails);

 var newProject = new Project(projectDetails);

 newProject
  .save()
  .then(function (project) {
   console.log(project);

   // admin added some members to the project put them in project user map
   if (projectDetails.members?.length > 0) {
    var addUserToProjectPromise = projectDetails.members.map(function (member) {
     console.log(member);
     return new ProjectUser({
      project: {
       _id: project._id,
       name: project.name,
       key: project.key,
      },
      user: {
       _id: member._id,
       firstname: member.firstname,
       lastname: member.lastname,
       email: member.email,
       image: member.image,
      },
     })
      .save()
      .then(function (projectUser) {})
      .catch(function (error) {
       console.log("Error adding user to project", error);
      });
    });

    return Promise.all(addUserToProjectPromise)
     .then(function () {
      return res.status(200).send({
       message: "Project created successfully",
       project: project,
      });
     })
     .catch(function (error) {
      // Error adding users
      return res
       .status(500)
       .send({ message: "Error adding users to project", error: error });
     });
   } else {
    // No members to add, send response directly
    return res
     .status(200)
     .send({ message: "Project created successfully", project: project });
   }
  })
  .catch(function (error) {
   console.error("Error creating project", error);

   return res
    .status(500)
    .send({ message: "Error creating project", error: error });
  });
}

//get all projects in batches
function getAllProjects(req, res) {
 var pageNo = req.query.pageNo;
 var pageSize = req.query.pageSize;
 var query = req.query.query;
 var skipVal = pageNo !== undefined ? (pageNo - 1) * pageSize : 0;

 var searchCondition = {};
 if (query !== undefined) {
  searchCondition = { name: { $regex: query, $options: "i" } };
 }

 if (req.user.role !== "SUPER_ADMIN") {
  searchCondition["companyDetails._id"] = req.user.companyDetails._id;
 }

 if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "COMPANY_ADMIN") {
  searchCondition["_id"] = { $in: req.projectIds };
 }

 Project.countDocuments(searchCondition)
  .then(function (totalCount) {
   var limitVal = pageSize !== undefined ? parseInt(pageSize) : totalCount;

   Project.find(searchCondition)
    .skip(skipVal)
    .limit(limitVal)
    .then(function (projectDocsArr) {
     var projectMembersPromise = projectDocsArr.map(function (project) {
      var projectWithMembers = project.toObject();
      return ProjectUser.find({
       "project._id": project._id,
       isUserActiveInProject: true,
      }).then(function (projectMembers) {
       var projectMembers = projectMembers.map((item) => item.user);
       projectWithMembers.members = projectMembers;
       return projectWithMembers;
      });
     });

     Promise.all(projectMembersPromise)
      .then(function (results) {
       var projectsWithMembers = results;

       var totalPages = Math.ceil(totalCount / pageSize);

       res.status(200).send({
        message: "Projects have been retrieved",
        projects: projectsWithMembers,
        success: true,
        pageNo: pageNo !== "undefined" ? parseInt(pageNo) : undefined,
        pageSize: pageSize !== "undefined" ? parseInt(pageSize) : undefined,
        totalPages: totalPages,
        query: query,
       });
      })
      .catch(function (err) {
       console.log("Error getting projects", err);
       res.status(500).send({ message: "Error getting projects", err: err });
      });
    })
    .catch(function (err) {
     console.log("Error getting projects", err);
     res.status(500).send({ message: "Error getting projects", err: err });
    });
  })
  .catch(function (err) {
   console.log("Error counting projects", err);
   res.status(500).send({ message: "Error counting projects", err: err });
  });
}

//get project by id
function getProjectById(req, res) {
 var _id = req.params._id;
 Project.findById({ _id })
  .then(function (project) {
   if (!project) {
    return res.status(510).send({ message: "Project not found" });
   }

   //  fetch members

   ProjectUser.find({ "project._id": project._id }).then(function (
    projectUsers
   ) {
    var users = projectUsers.map((item) => item.user);
    project = project.toObject();
    project.members = users;

    return res.status(200).json({ project: project });
   });
  })
  .catch(function (error) {
   console.error("Error fetching project details:", error);
   return res
    .status(510)
    .send({ message: "Error fetching project details", error: error });
  });
}


//edit a project
function editProject(req, res) {
 var projectId = req.params._id;
 var newData = req.body;

 if (newData.members) {
  newData.members = JSON.parse(newData.members);
 }
 if (newData.removedMembers) {
  newData.removedMembers = JSON.parse(newData.removedMembers);
 }

 if (req.files["logo"]) {
  console.log("req.body.previousLogo", req.body.previousLogo);
  deleteImagesFromS3(req.body.previousLogo);
  req.body.logo = req.files["logo"][0].location;
 }

 Project.findByIdAndUpdate(projectId, newData).then(function (project) {
  // remove those users which are present in removedUsers form projectUsercollection

  var addNewMembersPromise = newData.members.map(function (member) {
   return ProjectUser.findOneAndUpdate(
    {
     "project._id": project._id,
     "user._id": member._id,
    },
    {
     // Use $setOnInsert for fields that should only be added on creating a new document
     $setOnInsert: {
      // Assuming these are the fields required for a new document
      project: { _id: project._id, name: project.name, key: project.key },
      user: {
       _id: member._id,
       firstname: member.firstname,
       lastname: member.lastname,
       email: member.email,
       image: member.image,
      },
     },
     // Use $set for fields that should be updated on existing documents, or set on new ones
     $set: {
      isUserActiveInProject: true,
     },
    },
    {
     new: true, // Return the document after update, if it exists, or after insert
     upsert: true, // Create a new document if no existing document matches the query
    }
   );
  });

  var removedMembersPromise = newData.removedMembers.map(function (user) {
   return ProjectUser.findOneAndUpdate(
    {
     "project._id": project._id,
     "user._id": user._id,
    },
    { isUserActiveInProject: false }
   );
  });

  return Promise.all([
   Promise.all(removedMembersPromise),
   Promise.all(addNewMembersPromise),
  ])
   .then(function () {
    return res.status(200).send({
     message: "Project updated successfully",
     project: project,
    });
   })
   .catch(function (error) {
    return res
     .status(500)
     .send({ message: "Error updating project", error: error });
   });
 });
}

module.exports = { createProject, getAllProjects, getProjectById, editProject };

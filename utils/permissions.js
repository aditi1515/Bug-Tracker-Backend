var permissions = {
 SUPER_ADMIN: ["manageCompanies", "manageCompanyAdmin"],
 COMPANY_ADMIN: [
  "createProjects",
  "getProjects",
  "manageCompanyEmployee",
  "manageProjectMembers", //add , view , delete , update
 ],
 PROJECT_MANAGER: ["manageTickets"],
 EMPLOYEE: ["editAssignedTickets", "viewProjectTickets"],
};

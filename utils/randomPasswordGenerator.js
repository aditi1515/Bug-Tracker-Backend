function generateRandomPassword() {
 var capitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 var smallLetters = "abcdefghijklmnopqrstuvwxyz";
 var numbers = "0123456789";
 var symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

 var password = "";

 // Add one capital letter
 password += capitalLetters[Math.floor(Math.random() * capitalLetters.length)];

 // Add one number
 password += numbers[Math.floor(Math.random() * numbers.length)];

 // Add one symbol
 password += symbols[Math.floor(Math.random() * symbols.length)];

 // Add one small letter
 password += smallLetters[Math.floor(Math.random() * smallLetters.length)];

 // Add remaining characters
 for (var i = 0; i < 4; i++) {
  var characterType = Math.floor(Math.random() * 3);
  switch (characterType) {
   case 0:
    password +=
     capitalLetters[Math.floor(Math.random() * capitalLetters.length)];
    break;
   case 1:
    password += numbers[Math.floor(Math.random() * numbers.length)];
    break;
   case 2:
    password += symbols[Math.floor(Math.random() * symbols.length)];
    break;
   case 3:
    password += smallLetters[Math.floor(Math.random() * smallLetters.length)];
    break;
  }
 }

 // Shuffle the password characters
 password = password
  .split("")
  .sort(() => Math.random() - 0.5)
  .join("");
 return password;
}

module.exports = { generateRandomPassword };

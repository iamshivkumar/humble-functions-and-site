const express = require('express');
const appwrite = require("node-appwrite");
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('dotenv').config();

const client = new appwrite.Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6472f8e636a915c8dc64');

const account = new appwrite.Account(client);


app.get('/', (req, res) => {
  const userId = req.query.userId;
  const secret = req.query.secret;

  account.updateVerification(userId, secret)
    .then((response) => {
      console.log(response);
      try {
        res.redirect('appwrite-callback-6472f8e636a915c8dc64://success')
      } catch (error) {

      }
    })
    .catch((error) => {
      console.log(error); // Failure
      // res.send('Error updating verification');
      res.send(error);
    });

});


app.route('/reset-password')
  .get((req, res) => {
    const userId = req.query.userId;
    const secret = req.query.secret;

    // if valid, show the reset password form
    res.send('<form action="/reset-password" method="post">' +
      '<label for="password">New Password:</label>' +
      '<input type="password" id="password" name="password"><br><br>' +
      '<label for="cpassword">Confirm Password:</label>' +
      '<input type="password" id="cpassword" name="cpassword"><br><br>' +
      '<input type="hidden" name="userId" value="' + userId + '">' +
      '<input type="hidden" name="secret" value="' + secret + '">' +
      '<input type="submit" value="Reset Password">' +
      '</form>');

  })
  .post((req, res) => {
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    var userId = req.body.userId;
    var secret = req.body.secret;
    if (password !== cpassword) {
      res.send("Passwords do not match");
    } else {
      const promise = account.updateRecovery(userId, secret, password, cpassword);

      promise.then(function (response) {
        res.send('Your password has been reset successfully.');
      }, function (error) {
        res.send("Error in updating password " + error.message + `${userId}: ${secret}`);
      });
    }
  });


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});




document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Add event listener to submit email button
  document.querySelector('#compose-send').addEventListener('click',(response) => {
    response.preventDefault();

    // Send Email
    fetch('/emails', {
      method:'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
        .then(result => {
          console.log(result)
          load_mailbox('sent')
        })
  })
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Fetch the mail
  fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .catch(error => {
        console.log('FUCK')
      })
      .then(emails => {
        const emailList = document.createElement('ul')
        emailList.id = 'list'
        document.querySelector('#emails-view').append(emailList)
        let email;
        for (email in emails) {
          const mail = document.createElement('li')
          mail.innerHTML = email
          document.querySelector('#list').append(mail)
        }
      })

}

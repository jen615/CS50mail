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

  // Add event listener for archive buttons
  document.querySelectorAll('.archive-check').forEach((email) => {
    email.addEventListener('click', () =>{
      email
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
        console.log('FUCK:', error)
      })
      .then(emails => {
        console.log(emails)
        // Build Email Table
        mailTable()
        // Populate Email Table

        if (mailbox === 'inbox' || 'sent') {
          for (const email of emails) {
            // noinspection JSUnresolvedVariable
            if (email.archived) {
              continue
            }
            renderEmail(mailbox, email)
          }
        }
      })
}

function mailTable(mailbox) {

  // Make Email Table
  const emailList = document.createElement('table')
  emailList.id = 'e-table'
  const header = emailList.createTHead();
  const row = header.insertRow(0);

  // Table Headers
  const sender = row.insertCell(0);
  sender.innerHTML = '<b> Sender </b>'
  const time = row.insertCell(1);
  time.innerHTML = '<b> Time </b>'
  const subject = row.insertCell(2);
  subject.innerHTML = '<b> Subject </b>'
  const body = row.insertCell(3);
  body.innerHTML = '<b> Body </b>'

  if (mailbox === 'inbox' || 'archive') {
    const archive = row.insertCell(4);
    archive.innerHTML = '<b> Archive </b>'
  }

  // Add table to DOM
  document.querySelector('#emails-view').append(emailList)
}

function renderEmail(mailbox, email) {

  // Create new row for the email
  const mail = document.createElement('tr');

  if (email.read) {
    mail.className = 'read'
  }
  mail.className = 'email'

  const sender = mail.insertCell(0);
  sender.innerHTML = email.sender;
  const time = mail.insertCell(1);
  time.innerHTML = email.timestamp;
  const subject = mail.insertCell(2);
  subject.innerHTML = email.subject;
  const body = mail.insertCell(3);
  body.innerHTML = email.body;
  // Add archive option for inbox & archive box
  if (mailbox === 'inbox' || 'archive') {
    const archive = mail.insertCell(4);
    const check = document.createElement('input')
    check.type = 'checkbox'
    check.className = 'archive-check'
    check.value = email.archived
    archive.append(check)
  }
  document.querySelector('#e-table').append(mail)
}

function archiver() {

}

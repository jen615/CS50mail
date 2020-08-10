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
  
  // Show the mailbox and hide other views & clear email view
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = '';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Fetch the mail
  fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .catch(error => {
        console.log('FUCK:', error)
      })
      .then(emails => {
        // Build Email Table
        mailTable()
        // Populate Email Table, skip archived
        if (mailbox === 'inbox' || 'sent') {
          for (const email of emails) {
            // noinspection JSUnresolvedVariable
            if (email.archived) {
              continue
            }
            renderEmail(email)
          }
        }
      })
}

function mailTable() {

  // Make Email Table
  const emailList = document.createElement('div')
  emailList.id = 'email-list'


  // Table Headers
  const sender = document.createElement('span');
  sender.innerHTML = `<span class = "list-header"> Sender </span>`
  const subject = document.createElement('span');
  subject.innerHTML = `<span class = "list-header"> Subject </span>`
  const body = document.createElement('span');
  body.innerHTML = `<span class = "list-header"> Body </span>`
  const time = document.createElement('span');
  time.innerHTML = `<span class = "list-header"> Time </span>`

  emailList.append(sender, subject, body, time)

  // Add table to DOM
  document.querySelector('#emails-view').append(emailList)
}

function renderEmail(email) {

  // Create new button for the email
  const mail = document.createElement('button');

  mail.className = 'email'
  if (email.read) {
    mail.className += '\ read'
  }
  mail.id = email.id
  mail.addEventListener('click', () => {
    openEmail(email)
  })

  const sender = document.createElement('span');
  sender.innerHTML = email.sender;
  const subject = document.createElement('span');
  subject.innerHTML = email.subject;
  const body = document.createElement('span');
  body.innerHTML = `${email.body}`.slice(0,30)+'...';
  const time = document.createElement('span');
  time.innerHTML = email.timestamp;

  mail.append(sender, subject, body, time)
  document.querySelector('#email-list').append(mail)
}

function openEmail(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // fetch email info from the email id
  fetch(`/emails/${email.id}`)
      .then(response => response.json())
      .then(mail => {
        const subject = document.createElement('h3').innerHTML = mail.subject
        const from = document.createElement("div")
        from.className = 'form-group'
        from.innerHTML = `From: <input disabled class="form-control" value="${mail.sender}">`
        const body = document.createElement("p")
        body.innerText = mail.body

        document.querySelector('#email-view').append(subject, from, body)
      })
  setRead(email)
}

function setRead(email) {
  // Send PUT via fetch to mark email as read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  }).then(() => {
    console.log('got eem')
  })
}

function setArchived(email) {
  // Send PUT via fetch to mark email as archived
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  }).then(() => {
  })
}

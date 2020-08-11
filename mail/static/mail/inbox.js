document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');



});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Add event listener to send email button
  document.querySelector('#compose-send').addEventListener('click', (response) => {
    response.preventDefault();
    sendEmail()
  })
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
      .then(emails => {
        // Build email grid and fill it in
        mailGrid()
        for (const email of emails) {
          renderEmail(email, mailbox)
        }
      })
}

function mailGrid() {

  // Make Email Table
  const emailList = document.createElement('div')
  emailList.id = 'email-list'
  const headers = document.createElement("div")
  headers.className = 'headers'

  // Table Headers
  const sender = document.createElement('span');
  sender.innerHTML = `<span class = "list-header"> Sender </span>`
  const subject = document.createElement('span');
  subject.innerHTML = `<span class = "list-header"> Subject </span>`
  const body = document.createElement('span');
  body.innerHTML = `<span class = "list-header"> Body </span>`
  const time = document.createElement('span');
  time.innerHTML = `<span class = "list-header"> Time </span>`
  const archive = document.createElement('span');
  archive.innerHTML = `<span> <img src="/static/mail/archive.png" alt="Archive"> </span>`

  headers.append(sender, subject, body, time, archive)
  emailList.append(headers)

  // Add table to DOM
  document.querySelector('#emails-view').append(emailList)
}

function sendEmail() {

  fetch('/emails', {
    method: 'POST',
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
}

function renderEmail(email, mailbox) {

  // Create new button for the email
  const mail = document.createElement('button');
  mail.className = 'email'

  // Check if email is read
  if (email.read) {
    mail.className += '\ read'
  }

  const sender = document.createElement('span');
  sender.innerHTML = email.sender;
  const subject = document.createElement('span');
  subject.innerHTML = email.subject;
  const body = document.createElement('span');
  body.innerHTML = `${email.body}`.slice(0,30)+'...';
  const time = document.createElement('span');
  time.innerHTML = email.timestamp;

  // Add event listener to mail button
  mail.addEventListener('click', () => {
    openEmail(email, mailbox)
  })

  // Add email button to DOM
  mail.append(sender, subject, body, time, archiveCheck(email, mailbox))
  document.querySelector('#email-list').append(mail)
}

function openEmail(email, mailbox) {

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Fetch email contents
  fetch(`/emails/${email.id}`)
      .then(response => response.json())
      .then(mail => {

        const subject = document.createElement("div")
        subject.className = 'form-group, mail-header'
        subject.innerHTML = `Subject: <span> <input disabled class="form-control" value="${mail.subject}"> </span>`

        const from = document.createElement("div")
        from.className = 'form-group, mail-header'
        from.innerHTML = `From: <span> <input disabled class="form-control" value="${mail.sender}"> </span>`

        const body = document.createElement("div")
        body.className = 'form-group, mail-header'
        body.innerHTML = `Msg: <textarea disabled class="form-control " placeholder="${mail.body}">`

        // Add response buttons

        const buttonArea = document.createElement("div")
        buttonArea.className = 'button-area'

        const archive = document.createElement("button")
        archive.className = 'btn btn-primary'
        archive.innerHTML = (email.archived)? 'Restore' : 'Archive'

        archive.addEventListener('click', () => {
            setArchived(email, mailbox)
          })

        const reply = document.createElement("button")
        reply.className = 'btn btn-primary'
        reply.innerHTML = 'Reply'

          reply.addEventListener('click', () => {
              sendReply(email)
              }
          )

        buttonArea.append(archive, reply)

        // Add email and response buttons to DOM
        document.querySelector('#email-view').append(subject, from, body, buttonArea)
      })

  // Mark email as read
  setRead(email)
}

function setRead(email) {
  // Send PUT to mark email as read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  }).then(() => {
    console.log('got eem')
  })
}

function archiveCheck(email, mailbox) {
  const archive = document.createElement("span");
  const check = document.createElement('input')
  check.type = 'checkbox'
  check.className = 'archive-check'
  check.checked = email.archived
  archive.append(check)

  check.addEventListener('change', (e) =>{
    e.stopPropagation()
    setArchived(email, mailbox)
  })

  return archive
}

function setArchived(email, mailbox) {

  // Send PUT to mark email as archived
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !email.archived
    })
  }).then(() => {
    load_mailbox(mailbox)
  })
}

function sendReply(email) {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').innerHTML = `\n\nOriginal Msg From: ${email.sender} >> \n\n${email.body}`;

    // Add event listener to send email button
    document.querySelector('#compose-send').addEventListener('click', (response) => {
        response.preventDefault();
        sendEmail()
    })
}

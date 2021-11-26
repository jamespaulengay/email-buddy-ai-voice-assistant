const express = require('express');
const app = express();
const port = 3000 || process.env.NODE_ENV;
//imap
const Imap = require('imap');
const inspect = require('util').inspect;
const {
  simpleParser
} = require('mailparser');

//build
var fs = require('fs');
var base64 = require('base64-stream');
const {
  Base64Decode
} = require("base64-stream");

function toUpper(thing) {
  return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
}

//constructor JSON
var mailbox = [];
var mail = {
  date: "",
  Subject: "",
  Sender: "",
  Receiver: "",
  Content: "",
  Attachment: null
};
var test;
//this is to build attachment to a fully built file
/*
function buildAttMessageFunction(attachment) {
  var filename = attachment.params.name;
  var encoding = attachment.encoding;

  return function (msg, seqno) {
    var prefix = '(#' + seqno + ') ';
    msg.on('body', function(stream, info) {
      //Create a write stream so that we can stream the attachment to file;
      console.log(prefix + 'Streaming this attachment to file', filename, info);
      var writeStream = fs.createWriteStream(__dirname+'/'+filename);
      writeStream.on('finish', function() {
        console.log(prefix + 'Done writing to file %s', filename);
      });

      //stream.pipe(writeStream); this would write base64 data to the file.
      //so we decode during streaming using
      if (toUpper(encoding) === 'BASE64') {
        //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
        stream.pipe(new Base64Decode()).pipe(writeStream);
      } else  {
        //here we have none or some other decoding streamed directly to the file which renders it useless probably
       stream.pipe(writeStream);
      }

    });

    msg.once('end', function() {
    //  arr=[...new Set(arr)]
      // console.log(arr);
      // console.log(prefix + 'Finished attachment %s', filename);
    });

  };
}
*/


//this is to iterate each email to see if it has any disposition/attachment
function findAttachmentParts(struct, attachments) {
  attachments = attachments || [];
  //  console.log(attachments);
  for (var i = 0, len = struct.length, r; i < len; ++i) {
    if (Array.isArray(struct[i])) {
      findAttachmentParts(struct[i], attachments);
    } else {
      if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
        attachments.push(struct[i]);
      }
    }
  }
  return attachments;
}


var imap = new Imap({
  user: 'supernikki1234@gmail.com',
  password: 'HerbieChap1899',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
});
imap.once('ready', () => {
  imap.openBox('INBOX', false, (err,box) => {
    imap.search(['ALL', ['SINCE', new Date()]], (err, results) => {
      const f = imap.seq.fetch('1:*', {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
        struct: true
      });
      f.on('message', (msg, seqno) => {
        //console.log(msg);
          msg.on('body', stream => {
          test=simpleParser(stream);
          // var mail = {
          // date: parsed.date,
          // Subject: parsed.subject,
          // Sender: parsed.from.value,
          // Receiver: parsed.to.value,
          // Content: "",
          // Attachment: null
          test.then(res=>{
            console.log(res);
          })
        });
        //get attributes- attachments
        msg.once('attributes', attrs => {
          var attachments = findAttachmentParts(attrs.struct);
          for (var i = 0, len = attachments.length; i < len; ++i) {
            var attachment = attachments[i];
            var f = imap.fetch(attrs.uid, { //do not use imap.seq.fetch here
              bodies: [attachment.partID],
              struct: true
            });
            console.log(attachment);
            //build function to process attachment message
            //f.on('message', buildAttMessageFunction(attachment));
          }
        });
       });

      f.once('error', ex => {
        console.log("error:" + ex);
        return Promise.reject(ex);
      });
      f.once('end', () => {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });
});
imap.connect();

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
})

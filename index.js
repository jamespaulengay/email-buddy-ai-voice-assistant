const nodemailer=require('nodemailer');
const {google}=require('googleapis');

const config={
  CLIENT_ID:"756303327390-mivablbspt472rkfeb3brgckhr1nevkl.apps.googleusercontent.com",
  CLIENT_SECRET:"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",
  REDIRECT_URI:"https://developers.google.com/oauthplayground",
  REFRESH_TOKEN:"1//04CozvaNEFGr8CgYIARAAGAQSNwF-L9IrCABdqubq0aNaOlj100PsWdwN33zHq5kcOeN0yADdltz8eA9DkYCGwMjQXT99hufa0Io"
}

const oAuth=new google.auth.OAuth2(config.CLIENT_ID,config.CLIENT_SECRET,config.REDIRECT_URI);
oAuth.setCredentials({refresh_token:config.REFRESH_TOKEN})

async function sendMail(){
  try {
    const accesstoken=await oAuth.getAccessToken()
    const transport=nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'OAuth2',
        user:'supernikki1234@gmail.com',
        clientId:config.CLIENT_ID,
        clientSecret:config.CLIENT_SECRET,
        refreshToken:config.REFRESH_TOKEN,
        accessToken:accesstoken
      }
    })

    const mail={
      from:'Email Buddy <supernikki1234@gmail.com>',
      to:'supernikki1234@gmail.com',
      subject:'Test[2]',
      text:'Testing the API[2]',
    }
    const result=await transport.sendMail(mail)
    return result
  } catch (e) {
    console.log(e);
  }
}
sendMail().then(result=>{
  console.log(result);
}).catch(e=>console.log(e))

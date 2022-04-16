import random
import smtplib

code = random.randint(100000, 999999)
print(code)

gmail_user = 'allentyao123@gmail.com'
gmail_password = 'testingforthewin'

sent_from = gmail_user
to = ['yjeffliu@gmail.com']
subject = '2FA Code'
body = str(code)

email_text = """\
From: %s
To: %s
Subject: %s

%s
""" % (sent_from, ", ".join(to), subject, body)

smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
smtp_server.ehlo()
smtp_server.login(gmail_user, gmail_password)
smtp_server.sendmail(sent_from, to, email_text)
smtp_server.close()
    
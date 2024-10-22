# Student-planning-website
5 steps to install the system:

1.	Install MySQL database:
https://dev.mysql.com/doc/mysql-getting-started/en/
https://dev.mysql.com/doc/workbench/en/wb-installing.html

  2.	Create tables for database:
In the project, there is a folder named ‘database’. This folder contains a ‘create.sql’ script to create all relational tables for running the server.
To initialize the database, open MySQL workbench, open the ‘create.sql’ script and run it.
In the case, you have already used your own user and database or set password for MySQL user, you will have to specify them in the ‘index.js’ ﬁle:

                                    const db = mysql.createConnection({ host: 'localhost',
                                          user: '',
                                          password: '', 
                                          database: ''
                                          });

  3.	Install Node.js for running the server
Go to https://nodejs.org/en/download to download Node.js for the server computer.
After installing Node.js, you still need to install some packages for Node.js to run the server. To install those packages, navigate to the product directory and enter the following command in your command line application:

                                    npm install express express-session mysql

4.	Start the server
Finally, in the project directory, to start the server, run the following command:

                                    node index.js

5.	Access the server in local network
To access the server from the local network, users will need to have the IP address of the host computer running the server and ways to obtain the computer IP address will vary between operating systems. For example, on Windows, IP address could be obtained by using command ‘ipconfig/all’ but for Linux, IP address could be obtained from command ‘ip address’.
Suppose the server computer IP address is 192.168.1.10 then other computers connecting to the same local network can access the website by entering 192.168.1.10:8000 in the url ﬁeld of the web browser.

Command line instructions
=========================

Deploy to server 27.

    ssh -i path-to-pem ubuntu@192.168.0.27
    cd app/cs/Thanh-CurrencySwap/src
    ../buildscripts/deploy-ubuntu/deploy.sh
    git pass: vsii123
    
Migrate database
    
    node ./bin/setup.js

References
----------
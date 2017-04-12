# SARA - Sentinel Australia Regional Access

## Description

Three environments

* copernicus-dev (copernicus-dev.nci.org.au)
* copernicus-test (copernicus-test.nci.org.au)
* copernicus-prod (copernicus.nci.org.au)
 
All VMs are CentOS 6. Jerome, Hilmi and Thomas will have root on the copernicus-dev and copernicus-test VMs.
 
Jerome, Hilmi and Thomas will use copernicus-dev as their sandbox
 
Jerome and Geomatsys on completing a development cycle will deploy a complete solution into copernicus-test. Once a test cycle is complete, install scripts are then used for copernicus-prod (production).
 
copernicus-dev and copernicus-test will be firewalled to 193.54.123.223 and 194.199.172.* for ssh access and HTTP/S access.
 
Fang and Joseph will install copernicus-prod (copernicus.nci.org.au). Joseph and Fang will have root on copernicus-prod. Prior to general release HTTP/S will be firewalled to 193.54.123.223, 194.199.172.* and GA/NCI network ranges.
 
All VMs will have read-only NFS access to /g/data2/fj7/Copernicus which is where all our Sentinel-1,2,3 data resides.
 
It would be good to know how to monitor the whole stack once it has gone into production i.e. log locations and error messages to look out for, and corrective actions to take. 

## Installation

Connect to development server

	ssh root@130.56.243.96

We suppose that the sources will be stored under $SARA_SRC

    mkdir -v /root/sara/src
	export SARA_SRC=/root/sara/src/sara

### Initialize sources repository

**These command should be launch to initialize the SARA sources (i.e. for an install from scratch)**

	# Clone repository to "sara" directory
    git clone https://github.com/jjrom/sara.git $SARA_SRC

    # Avoid to ask for password everytime you update the local repository
    cd $SARA_SRC
    git remote set-url origin git+ssh://git@github.com/jjrom/sara.git

    # Update resto
    git submodule init
    git submodule update


## Post installation configuration


Start nginx on reboot

    chkconfig --add nginx
    chkconfig --levels 235 nginx on

Start php-fpm on reboot

    chkconfig --add php-fpm
    chkconfig --levels 235 php-fpm on





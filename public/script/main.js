var config = {
  apiKey: "AIzaSyDKKn4NJOgkXabKw8Vy_dHvX-GU0PUkIh0",
  authDomain: "beam-6d752.firebaseapp.com",
  databaseURL: "https://beam-6d752.firebaseio.com",
  storageBucket: "beam-6d752.appspot.com",
};

var loggedInUser;
firebase.initializeApp(config);


firebase.auth().onAuthStateChanged(authenticate);


function authenticate(user){
	if(user){
		loggedInUser = user;
		if(window.location.pathname === "/"){
			window.location = "home.html";
		}
		return;
	}
	if(window.location.pathname === "/"){
		var ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#container', {
          signInSuccessUrl: 'home.html',
          signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID          ],
        });
	}
	else {
		window.location = "/";
	}
}


function loadData(){
	var database = firebase.database().ref("/devices/");
	database.on('value', function (snapshot) {
		var devices = snapshot.val();
		var deviceList = $("#deviceList");
		var usedList = $("#usedList");
		deviceList.empty();
		usedList.empty();
		for(var device in devices){
			var product = devices[device];
			if(product.leased){
				usedList.append(createDom(device,product));
			}else{
				deviceList.append(createDom(device,product));
			}
		}
		forceRefresh();
	});
}

function forceRefresh() {
    try {
        $("#deviceList").listview("refresh");
         $("#usedList").listview("refresh");
    } catch (error) {
        return;
    }
}

function releaseDevice(product){
	var shouldRelease = confirm("Do you want to release the "+product);
	if(shouldRelease){
		firebase.database().ref("/devices/"+product+"/leased").set(false);	
	}
}

function handleSelect(product){
	var shouldLease = confirm("Do you want to lease "+product);
	if(shouldLease){
		firebase.database().ref("/devices/"+product+"/leased").set(true);
		firebase.database().ref("/devices/"+product+"/tenant").set(loggedInUser.email);
		firebase.database().ref("/devices/"+product+"/lease").set({ time: firebase.database.ServerValue.TIMESTAMP });


	}
}

function createDom(name,product) {

	var linkInformation = "";

	if(product.leased && product.tenant === loggedInUser.email){
		linkInformation = "<li class='Container' style='color:red' id='" + name + "' onClick=\"releaseDevice("  + " '" + name + "');\"> <a href='#popupInfo'> ";
	}else if(!product.leased){
		linkInformation = "<li class='Container' style='color:red' id='" + name + "' onClick=\"handleSelect("  + " '" + name + "');\"> <a href='#popupInfo'> ";
	}else{
		linkInformation = "<li class='Container' style='color:red' id='" + name + "> <a href='#popupInfo'> ";
	}
	
    
    var deviceTitle = '<div >Device Name: ' + name + '</div><br/>';
    var tenant = product.leased? '<span >Leased By: ' + product.tenant + '</span></div><br/>': ""; 
   	var leaseTime = product.leased && product.lease? '<span >Leased from: ' + new Date(product.lease.time).toDateString() + '</span></div><br/>': ""; 
   	var technology = '<span >Technology: ' + product.meta.technology + '</span></div><br/>';
   	var band2g = '<span >Band 2G : ' + product.meta.band2g + '</span></div><br/>';
   	var band3g = '<span >Band 3G : ' + product.meta.band3g + '</span></div><br/>';
   	var band4g = '<span >Band 4G : ' + product.meta.band4g + '</span></div><br/>';


    var closingTags = "</a></li>";
    return linkInformation + deviceTitle + tenant + leaseTime + technology + band2g+ band3g+ band4g+closingTags;

}
    
      
  
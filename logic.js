let user = {};
var fs = new FamilySearch({
  environment: 'production',
  appKey: 'a02j000000KTRjpAAH',
  redirectUri: 'https://misbach.github.io/fs-personhistory/'
  // redirectUri: 'http://localhost:5000/'
});

// Finish oauth flow by obtaining access_token
fs.oauthResponse(function() {
	$('.login').hide();
});

// Get Change History for PID
$('.getHistory').click(function() {
	getChanges('https://api.familysearch.org/platform/tree/persons/'+$('.pid').val()+'/changes');
});

// Recursively process all change entries
let entries = [];
function getChanges(url) {
	fs.get(url,	{ headers: { Accept: 'application/x-gedcomx-atom+json'} }, function(error, rsp) {
			console.log(rsp.data);

			// Process all changes
			for (var i = 0; i < rsp.data.entries.length; i++) {
				entries.push(rsp.data.entries[i]);
				let date = new Date(rsp.data.entries[i].updated);
				let resourceId = (rsp.data.entries[i].changeInfo[0].resulting) ? rsp.data.entries[i].changeInfo[0].resulting.resourceId : rsp.data.entries[i].changeInfo[0].removed.resourceId;

				$('.changes').append('<li class="entry" id="'+entries.length+'">'+date.toDateString()+' - '+rsp.data.entries[i].title+'\
					by '+rsp.data.entries[i].contributors[0].name+'<br />\
					<span class="resourceId">'+resourceId+'</span>\
					<pre></pre></li>');
			}
			$('.count').text(entries.length);

			// Get next page of changes
			if (rsp.data.links.next.href.indexOf("EMPTY_LAST_PAGE") < 0) {
				getChanges(rsp.data.links.next.href);
			}
	});

}

// Display change details when item is clicked
$(document).on("click",".entry", function (elem) {
	console.log(elem);
  $(elem.target).find('pre').append(JSON.stringify(entries[elem.target.id-1].content.gedcomx).replace(/,/g,",\n"));
  console.log(entries[elem.target.id-1].content.gedcomx);
});
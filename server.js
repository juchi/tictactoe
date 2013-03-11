var fs = require('fs');

function onRequest(request, response)
{
	if (request.url != '/') {
		var res = fs.readFileSync('./front/'+request.url);
		response.end(res);
	} else {
		var html = fs.readFileSync('front/index.html');
		response.writeHead({'Content-Type': 'text/html'});
		response.write(html);
		response.end();
	}
}

exports.onRequest = onRequest;

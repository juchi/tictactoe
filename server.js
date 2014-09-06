var fs = require('fs');

function onRequest(request, response)
{
    if (request.url != '/') {
        fs.readFile('./front/'+request.url, function(err, data) {
            if (err) {
                response.writeHead(404);
                response.end();
            } else {
                response.end(data);
            }
        });
    } else {
        fs.readFile('front/index.html', function (err, data) {
            if (err) {
                response.writeHead(404);
                response.end();
            } else {
                response.writeHead({'Content-Type': 'text/html'});
                response.write(data);
                response.end();
            }

        });
    }
}

exports.onRequest = onRequest;

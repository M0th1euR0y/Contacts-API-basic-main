import { createServer } from 'http';
import fs from 'fs';

function allowAllAnonymousAccess(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
}
function accessControlConfig(req, res) {
    if (req.headers['sec-fetch-mode'] == 'cors') {
        allowAllAnonymousAccess(res);
        console.log("Client browser CORS check request");
    }
}
function CORS_Preflight(req, res) {
    if (req.method === 'OPTIONS') {
        res.end();
        console.log("Client browser CORS preflight check request");
        return true;
    }
    return false;
}
function extract_Id_From_Request(req) {
    // .../api/ressources/id
    let parts = req.url.split('/');
    return parseInt(parts[parts.length - 1]);
}
function validateFavori(favori) {
    if (!('Title' in favori)) return 'Title is missing';
    if (!('Url' in favori)) return 'Url is missing';
    if (!('Category' in favori)) return 'Category is missing';
    return '';
}
async function handleFavorisServiceRequest(req, res) {
    if (req.url.includes("/api/favoris")) {
        const favorisFilePath = "./favoris.json";
        let favorisJSON = fs.readFileSync(favorisFilePath);
        let favoris = JSON.parse(favorisJSON);
        let validStatus = '';
        let id = extract_Id_From_Request(req);
        switch (req.method) {
            case 'GET':
                if (isNaN(id)) {
                    res.writeHead(200, { 'content-type': 'application/json' });
                    res.end(favorisJSON);
                } else {
                    let found = false;
                    for (let favori of favoris) {
                        if (favori.Id === id) {
                            found = true;
                            res.writeHead(200, { 'content-type': 'application/json' });
                            res.end(JSON.stringify(favori));
                            break;
                        }
                    }
                    if (!found) {
                        res.writeHead(404);
                        res.end(`Error : The favori of id ${id} does not exist`);
                    }
                }
                break;
            case 'POST':
                let newFavori = await getPayload(req);
                validStatus = validateFavori(newFavori);
                if (validStatus == '') {
                    let maxId = 0;
                    favoris.forEach(favori => {
                        if (favori.Id > maxId)
                            maxId = favori.Id;
                    });
                    newFavori.Id = maxId + 1;
                    favoris.push(newFavori);
                    fs.writeFileSync(favorisFilePath, JSON.stringify(favoris));
                    res.writeHead(201, { 'content-type': 'application/json' });
                    res.end(JSON.stringify(newFavori));
                } else {
                    res.writeHead(400);
                    res.end(`Error: ${validStatus}`);
                }
                break;
            case 'PUT':
                let modifiedFavori = await getPayload(req);
                validStatus = validateFavori(modifiedFavori);
                if (validStatus == '') {
                    if (!isNaN(id)) {
                        if (!('Id' in modifiedFavori)) modifiedFavori.Id = id;
                        if (modifiedFavori.Id == id) {
                            let storedFavori = null;
                            for (let favori of favoris) {
                                if (favori.Id === id) {
                                    storedFavori = favori;
                                    break;
                                }
                            }
                            if (storedFavori != null) {
                                storedFavori.Title = modifiedFavori.Title;
                                storedFavori.Url = modifiedFavori.Url;
                                storedFavori.Category = modifiedFavori.Category;
                                fs.writeFileSync(favorisFilePath, JSON.stringify(favoris));
                                res.writeHead(200);
                                res.end();
                            } else {
                                res.writeHead(404);
                                res.end(`Error: The favori of id ${id} does not exist.`);
                            }
                        } else {
                            res.writeHead(409);
                            res.end(`Error: Conflict of id`);
                        }
                    } else {
                        res.writeHead(400);
                        res.end("Error : You must provide the id of favori to modify.");
                    }
                } else {
                    res.writeHead(400);
                    res.end(`Error: ${validStatus}`);
                }
                break;
            case 'DELETE':
                if (!isNaN(id)) {
                    let index = 0;
                    let oneDeleted = false;
                    for (let favori of favoris) {
                        if (favori.Id === id) {
                            favoris.splice(index, 1);
                            fs.writeFileSync(favorisFilePath, JSON.stringify(favoris));
                            oneDeleted = true;
                            break;
                        }
                        index++;
                    }
                    if (oneDeleted) {
                        res.writeHead(204); // success no content
                        res.end();
                    } else {
                        res.writeHead(404);
                        res.end(`Error: The favori of id ${id} does not exist.`);
                    }
                } else {
                    res.writeHead(400);
                    res.end("Error : You must provide the id of favori to delete.");
                }
                break;
            case 'PATCH':
                res.writeHead(501);
                res.end("Error: The endpoint PATCH api/favoris is not implemented.");
                break;
        }
        return true;
    }
    return false;
}

function handleRequest(req, res) {
    return handleFavorisServiceRequest(req, res);
}

function getPayload(req) {
    return new Promise(resolve => {
        let body = [];
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            if (body.length > 0)
                if (req.headers['content-type'] == "application/json")
                    try { resolve(JSON.parse(body)); }
                    catch (error) { console.log(error); }
            resolve(null);
        });
    })
}

const server = createServer(async (req, res) => {
    console.log(req.method, req.url);
    accessControlConfig(req, res);
    if (!CORS_Preflight(req, res))
        if (!handleRequest(req, res)) {
            res.writeHead(404);
            res.end();
        }
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

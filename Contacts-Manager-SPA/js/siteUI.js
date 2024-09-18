let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderFavoris();
    $('#createFavori').on("click", async function () {
        saveContentScrollPosition();
        renderCreateFavoriForm();
    });
    $('#abort').on("click", async function () {
        renderFavoris();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createFavori").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(` 
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <p>
                    Auteur: Mathieu Roy
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}

async function renderFavoris() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavori").show();
    $("#abort").hide();
    let favoris = await API_GetFavoris();
    eraseContent();
    if (favoris !== null) {
        favoris.forEach(favori => {
            if(selectedCategory === "" || favori.Category === selectedCategory){
                $("#content").append(renderFavori(favori));
            }
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavoriForm(parseInt($(this).attr("editFavoriId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavoriForm(parseInt($(this).attr("deleteFavoriId")));
        });
        $(".favorisRow").on("click", function (e) { e.preventDefault(); })
        let categorie = getCategorie(favoris);
        updateDropDownMenu(categorie)
    } else {
        renderError("Service introuvable");
    }
}

function getCategorie(favoris){
    let categories = new Set();
    favoris.forEach(favoris => {
        if(favoris.Category){
            categories.add(favoris.Category);
        }
    });
    return Array.from(categories);
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}

function eraseContent() {
    $("#content").empty();
}

function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}

function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}

function renderError(message) {
    eraseContent();
    $("#content").append(
        $(` 
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}

function renderCreateFavoriForm() {
    renderFavoriForm();
}

async function renderEditFavoriForm(id) {
    showWaitingGif();
    let favori = await API_GetFavori(id);
    if (favori !== null)
        renderFavoriForm(favori);
    else
        renderError("Favori introuvable!");
}

async function renderDeleteFavoriForm(id) {
    showWaitingGif();
    $("#createFavori").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let favori = await API_GetFavori(id);
    eraseContent();
    if (favori !== null) {
        const favoriIconUrl = getFavorisIcon(favori.Url);
        $("#content").append(` 
        <div class="favorisdeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="favorisRow" favori_id=${favori.Id}">
                <div class="favorisContainer">
                <div class="favorisLayout">
                    <div class="favorisName"><span ><img src="${favoriIconUrl}" class="favicon"></span>${favori.Title}</div>
                    <div class="favorisPhone">${favori.Url}</div>
                    <div class="favorisEmail">${favori.Category}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteFavori" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteFavori').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteFavori(favori.Id);
            if (result)
                renderFavoris();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderFavoris();
        });
    } else {
        renderError("Favori introuvable!");
    }
}

function newFavori() {
    favori = {};
    favori.Id = 0;
    favori.Title = "";
    favori.Url = "";
    favori.Category = "";
    return favori;
}

function renderFavoriForm(favori = null) {
    $("#createFavori").hide();
    $("#abort").show();
    eraseContent();
    let create = favori == null;

    $("#actionTitle").text(create ? "Création" : "Modification");
    if(favori != null){
        const favoriIconUrl = getFavorisIcon(favori.Url);

        $("#content").append(`
            <form class="form" id="favorisForm">
            <input type="hidden" name="Id" value="${favori.Id}"/>
            
             <div>
                <span ><img src="${favoriIconUrl}" class="favicon"></span>
             </div>
    
            <label for="Title" class="form-label">Titre </label>
                <input 
                    class="form-control Alpha"
                    name="Title" 
                    id="Title" 
                    placeholder="Titre"
                    required
                    RequireMessage="Veuillez entrer un titre"
                    InvalidMessage="Le titre comporte un caractère illégal" 
                    value="${favori.Title}"
                />
                <label for="Url" class="form-label">Url </label>
                <input
                    class="form-control Url"
                    name="Url"
                    id="Url"
                    placeholder="Url"
                    required
                    RequireMessage="Veuillez entrer votre Url" 
                    InvalidMessage="Veuillez entrer un Url valide"
                    value="${favori.Url}" 
                />
                <label for="Category" class="form-label">categorie </label>
                <input 
                    class="form-control Category"
                    name="Category"
                    id="Category"
                    placeholder="Category"
                    required
                    RequireMessage="Veuillez entrer votre categorie" 
                    InvalidMessage="Veuillez entrer un categorie valide"
                    value="${favori.Category}"
                />
                <hr>
                <input type="submit" value="Enregistrer" id="saveFavori" class="btn btn-primary">
                <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
            </form>
            `
        ); }else{
            if(create) favori = newFavori();
            $("#content").append(`
                <form class="form" id="favorisForm">
                <input type="hidden" name="Id" value="${favori.Id}"/>
        
                <label for="Title" class="form-label">Titre </label>
                    <input 
                        class="form-control Alpha"
                        name="Title" 
                        id="Title" 
                        placeholder="Titre"
                        required
                        RequireMessage="Veuillez entrer un titre"
                        InvalidMessage="Le titre comporte un caractère illégal" 
                        value="${favori.Title}"
                    />
                    <label for="Url" class="form-label">Url </label>
                    <input
                        class="form-control Url"
                        name="Url"
                        id="Url"
                        placeholder="Url"
                        required
                        RequireMessage="Veuillez entrer votre Url" 
                        InvalidMessage="Veuillez entrer un Url valide"
                        value="${favori.Url}" 
                    />
                    <label for="Category" class="form-label">categorie </label>
                    <input 
                        class="form-control Category"
                        name="Category"
                        id="Category"
                        placeholder="Category"
                        required
                        RequireMessage="Veuillez entrer votre categorie" 
                        InvalidMessage="Veuillez entrer un categorie valide"
                        value="${favori.Category}"
                    />
                    <hr>
                    <input type="submit" value="Enregistrer" id="saveFavori" class="btn btn-primary">
                    <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
                </form>        
    `);
    }
    initFormValidation();
    $('#favorisForm').on("submit", async function (event) {
        event.preventDefault();
        let favori = getFormData($("#favorisForm"));
        favori.Id = parseInt(favori.Id);
        showWaitingGif();
        let result = await API_SaveFavori(favori, create);
        if (result)
            renderFavoris();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderFavoris();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderFavori(favori) {
    const favoriIconUrl = getFavorisIcon(favori.Url);
    console.log("Favori URL:", favori.Url); // Log the URL for debugging
    return $(`
        <div class="favorisRow" favori_id="${favori.Id}">
            <div class="favorisContainer noselect">
                <div class="favorisLayout">
                    <div class="favorisTitleContainer">
                        <span><img src="${favoriIconUrl}" class="favicon"></span>
                        <span class="favorisTitle">${favori.Title}</span>
                    </div>
                    <span class="favorisCategory">
                        <a href="${favori.Url}" target="_blank">${favori.Category}</a>
                    </span>
                </div>
                <div class="favorisCommandPanel">
                    <span class="editCmd cmdIcon fa fa-pencil" editFavoriId="${favori.Id}" title="Modifier ${favori.Name}"></span>
                    <span class="deleteCmd cmdIcon fa fa-trash" deleteFavoriId="${favori.Id}" title="Effacer ${favori.Name}"></span>
                </div>
            </div>
        </div>
    `);
}

function getFavorisIcon(url){
    const domain = (new URL(url)).origin;
    return `${domain}/favicon.ico`;
}

let selectedCategory = ""; 
 
function updateDropDownMenu(categories) { 
    let DDMenu = $("#DDMenu"); 
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw"; 
    DDMenu.empty(); 
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="allCatCmd"> 
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories 
        </div> 
        `)); 
    DDMenu.append($(`<div class="dropdown-divider"></div>`)); 
    categories.forEach(category => { 
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw"; 
        DDMenu.append($(` 
            <div class="dropdown-item menuItemLayout category" id="allCatCmd"> 
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category} 
            </div> 
        `)); 
    }) 
    DDMenu.append($(`<div class="dropdown-divider"></div> `)); 
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="aboutCmd"> 
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos... 
        </div> 
        `)); 
    $('#aboutCmd').on("click", function () { 
        renderAbout(); 
    }); 
    $('#allCatCmd').on("click", function () { 
        selectedCategory = ""; 
        renderFavoris(); 
    }); 
    $('.category').on("click", function () { 
        selectedCategory = $(this).text().trim(); 
        renderFavoris(); 
    }); 
} 
 
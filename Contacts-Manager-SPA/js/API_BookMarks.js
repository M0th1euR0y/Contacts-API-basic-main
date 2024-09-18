const API_URL = "http://localhost:5000/api/favoris";

function API_GetFavoris() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            success: favoris => { resolve(favoris); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}

function API_GetFavori(favoriId) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + favoriId,
            success: favori => { resolve(favori); },
            error: () => { resolve(null); }
        });
    });
}

function API_SaveFavori(favori, create) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + (create ? "" : "/" + favori.Id),
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(favori),
            success: (/*data*/) => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}

function API_DeleteFavori(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + id,
            type: "DELETE",
            success: () => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}

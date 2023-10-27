function showLoader() {
    $('#id_loader').show();
}

function hideLoader() {
    $('#id_loader').hide();
}

const apiClient = axios.create({
    headers: {
        'X-CSRFToken': $('#id_csrf_token').val(),
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(function (config) {
    showLoader();
    return config;
}, function (error) {
    hideLoader();
    return Promise.reject(error);
});

apiClient.interceptors.response.use(function (response) {
    hideLoader();
    return response;
}, function (error) {
    hideLoader();
    return Promise.reject(error);
});

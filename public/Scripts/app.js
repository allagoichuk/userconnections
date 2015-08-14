function ViewModel() {
    var self = this;

    var tokenKey = 'accessToken';

    self.result = ko.observable();
    self.isError = ko.observable();

    self.user = ko.observable();

    self.registerEmail = ko.observable();
    self.registerPassword = ko.observable();
    self.registerPassword2 = ko.observable();

    self.loginEmail = ko.observable();
    self.loginPassword = ko.observable();

    self.relations = ko.observable();
    self.isAuthenticated = ko.observable(false);
    self.isRegistered = ko.observable(false);
    self.isAdmin = ko.observable(false);

    self.allRelations = ko.observable();

    function showError(jqXHR) {
        self.result(jqXHR.status + ': ' + jqXHR.statusText);
        self.isError(true);
    }
 
    self.getUserRelations = function () {
        self.result('');
        self.isError(false);

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: '/api/relations',
            headers: headers
        }).done(function (data) {
            var list = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var listItem = {
                    OtherId: item.OtherId,
                    OtherEmail: item.OtherEmail,
                    IsLinked: ko.observable(item.IsLinked),
                    Updating: ko.observable()
                };
                list.push(listItem);
            }
            self.relations(list);
        }).fail(showError);
    }

    self.revertRelation = function (relation)
    {
        self.result('');
        self.isError(false);

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        var verb = 'POST';
        if (relation.IsLinked())
            verb = "DELETE";

        relation.Updating(true);

        $.ajax({
            type: verb,
            url: '/api/relations/' + relation.OtherId,
            headers: headers
        }).done(function (data) {
            relation.Updating(false);
            relation.IsLinked.valueHasMutated();
        }).fail(showError);
    }

    self.getAllRelations = function () {
        self.result('');
        self.isError(false);

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: '/api/relations/all',
            headers: headers
        }).done(function (data) {
            self.allRelations(data);
        }).fail(showError);
    }

    self.register = function () {
        self.result('');
        self.isError(false);

        var data = {
            Email: self.registerEmail(),
            Password: self.registerPassword(),
            ConfirmPassword: self.registerPassword2()
        };

        $.ajax({
            type: 'POST',
            url: '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.result("Done!");
            self.isRegistered(true);
        }).fail(showError);
    }

    self.login = function () {
        self.result('');
        self.isError(false);

        var loginData = {
            grant_type: 'password',
            username: self.loginEmail(),
            password: self.loginPassword()
        };

        $.ajax({
            type: 'POST',
            url: '/login',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(loginData)
        }).done(function (data) {
            self.user(data.userName);
            self.isAuthenticated(true);
            self.isRegistered(false);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            self.setIsAdmin();
            self.getUserRelations();
        }).fail(showError);
    }

    self.setIsAdmin = function () {
        self.result('');
        self.isError(false);

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: '/api/Account/IsAdmin',
            headers: headers
        }).done(function (data) {
            self.isAdmin(data)
            if (self.isAdmin())
                self.getAllRelations();
        }).fail(showError);

    }

    self.logout = function () {

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'POST',
            url: '/api/Account/Logout',
            headers: headers
        }).done(function (data) {
        }).fail(showError);

        self.user('');
        self.isAuthenticated(false);
        self.isAdmin(false);
        sessionStorage.removeItem(tokenKey)
    }
}

var app = new ViewModel();
ko.applyBindings(app);
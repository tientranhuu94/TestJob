'use strict';


var app = angular.module('widget1', []);
app.controller('myCtrl', ['$scope', '$http', function($scope, $http) {
    var options = {
        rowIDs: [],
        widget: [],
        rowSelected: {}
    };
    // request to get data
    function getData() {
        $http({
            method: 'GET',
            url: '../data.json'
        }).then(function successCallback(response) {
            options.rowIDs = [];
            for (var i in response.data.widget) {
                options.rowIDs.push(response.data.widget[i].id);

            }
            // Get an entire row
            options.widget = response.data.widget;
        }, function errorCallback(response) {

        });
    }
    //refresh every 10s
    setInterval(getData, 10000)
        // public function to View

    // click widget event
    function getWidget(index) {
        options.rowSelected = options.widget[index];
    }

    function cleanRowSelected() {
        options.rowSelected = {}
    }
    $scope.options = options;
    $scope.getData = getData;
    $scope.getWidget = getWidget;
    $scope.cleanRowSelected = cleanRowSelected;
}]);

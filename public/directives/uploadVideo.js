app.directive('uploadVideo', function ($timeout, $sce, $http) {
    return {
        restrict: 'E',
        templateUrl: 'views/uploadVideoView.html',
        link: function (scope, element, attrs) {
            scope.progress = 0;
            scope.status = 'idle';
            scope.videoUrl = '';
            scope.hashId = '';
            scope.passCode = '9ec926e046f6dadb580573d11cf3800cc67b8596d4b45f8814c8082bd4ccfa0f';

            scope.checkStatus = function () {
                console.log('inside check status : ' + scope.hashId);
                console.log('https://api.wistia.com/v1/medias/' + scope.hashId + '.json?api_password=' + scope.passCode);
                $http({
                    method: 'GET',
                    url: 'https://api.wistia.com/v1/medias/' + scope.hashId + '.json?api_password=' + scope.passCode
                }).then(function (res) {
                    scope.status = res.data.status || '';
                    console.log("Current Status " + scope.status);
                    if (scope.status == 'ready')
                        scope.url = $sce.trustAsResourceUrl('http://fast.wistia.net/embed/iframe/' + scope.hashId);
                    else if (scope.status != 'failed') {
                        //check status again in a few seconds
                        $timeout(function () {
                            scope.checkStatus();
                        }, 3000);
                    }
                });
            };

            $timeout(function () {
                $('#uploadBtn').fileupload({
                    dataType: 'json',
                    formData: {
                        api_password: scope.passCode
                    },
                    add: function (e, data) {

                        scope.hashId = '';
                        scope.progress = 0;
                        scope.status = 'uploading';
                        scope.url = '';
                        data.submit();
                    },
                    done: function (e, data) {
                        console.log('video uploaded..');

                        if (data.result.hashed_id != '') {
                            scope.hashId = data.result.hashed_id;
                            scope.checkStatus();
                        }
                    },
                    progressall: function (e, data) {
                        if (data.total > 0) {
                            scope.$apply(function () {
                                scope.progress = parseInt(data.loaded / data.total * 100, 10);

                            });
                        }
                    }
                });
            });
        }

    }

});
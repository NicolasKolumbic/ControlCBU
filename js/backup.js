
angular
    .module('myApp', [])
    .directive('controlOnlyNumbers',
    [function () {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                model: '=',
                ngClass: '=',
                required: '@',
                readonly: '@',
                float: '@',
                beforeComa: '@',
                afterComa: '@',
                prefix: '@',
                subfix: '@',
                PCharacter: '@',
                SCharacter: '@',
                decimal: '@',
                miles: '@',
                cssClass: '@',
                value: '=',
                disabled: '@'
            },
            templateUrl: './controlOnlyNumbers.html',
            link: function (scope, elm, attrs) {
                scope.Setting.model = attrs.model;
                if(scope.Setting.disabled)elm.find("input").prop('disabled',true);
                elm.on('keydown', function (event) {
                    scope.Methods.keyUp.call(this, event);
                });
                elm.find('input').on('blur', function (event) {

                    scope.Methods.blur.call(this, event);
                });
               

            },
            controller: Numbercontroller,
        };
    }]);

function Numbercontroller($scope) {

  


    $scope.Setting = {
        id: !$scope.id ? "" : $scope.id,
        model: !$scope.model ? "" : $scope.model,
        ngclass: !$scope.ngClass ? "" : $scope.ngClass,
        required: !$scope.required ? false : ($scope.required == "true"),
        readonly: !$scope.readonly ? false : ($scope.readonly == 'true'),
        float: !$scope.float ? true : ($scope.float == "true"),
        beforecoma: !$scope.beforeComa ? 4 : $scope.beforeComa,
        aftercoma: !$scope.afterComa ? 2 : $scope.afterComa,
        prefix: !$scope.prefix ? false : ($scope.prefix == 'true'),
        subfix: !$scope.subfix ? false : ($scope.subfix == 'true'),
        pcharacter: !$scope.PCharacter ? "" : $scope.PCharacter,
        scharacter: !$scope.SCharacter ? "" : $scope.SCharacter,
        decimal: !$scope.decimal ? 2 : $scope.decimal,
        miles: !$scope.miles ? true : ($scope.miles == 'true'),
        cssclass: !$scope.cssClass ? "" : $scope.cssClass,
        default: !$scope.default ? "" : $scope.default,
        zeros: !$scope.zeros ? true : ($scope.zeros == 'true'),
        value: !$scope.value && $scope.value != 0 ? "" : $scope.value,
        disabled: !$scope.disabled && $scope.disabled != "" ? false : ($scope.disabled == 'true'),
    };

    $scope.Methods = {
        blur: function (event) {
            var _ = $scope.Methods;
            var setting = $scope.Setting;
            var m = setting.model.split(".");
            var value = _.findScope($scope, m, setting, this, _, event);
            var splitModel = function () {
                $scope.$parent[m[0]][m[1]] = "";
            }

            if (value.value != undefined && value.res) {
                value = _.PrefixSubfix(setting, value.value, value);

                value = _.EliminarCaracteresNoNumericos(setting, value.value, value);

                if (value.value.indexOf(',') == -1 && value.value.replace(/\,/, '').length > setting.beforecoma) {
                    this.value = "";
                    $scope.$apply(splitModel);
                    return;

                }

                if (setting.float && value.value != "") {
                    _.BlurFloatValidation(value.value, value, setting, _)
                } else if (value.value != "") {
                    value.value = parseInt(value.value).toString();
                    if (setting.miles && value.value.toString().length > 3) {
                        _.PuntosMiles(value.value + ",", value, setting);
                    }

                }
            }

            value.value = setting.prefix && setting.PCharacter != '' ? setting.PCharacter + value : value.value;
            value.value = setting.subfix && setting.SCharacter != '' ? setting.SCharacter + value : value.value;
            this.value = value.value != undefined ? value.value:"";
        },
        keyUp: function (event, ModelCtrl) {
            var _ = $scope.Methods;
            var setting = $scope.Setting;
            var value = _.findScope($scope, setting.model.split("."), setting, this, _, event);

            if (value.res) {
                value = _.PrefixSubfix(setting, value.value, value);
                if (event.which == 188 || event.which == 44) {
                    if (!value.value || value.value.indexOf(',') != -1 || !setting.float) {
                        _.Stop(event);
                    }
                } else if (value.value == '0' && !setting.float && event.which == 96) {
                    _.Stop(event);
                }
                else if (event.which == 64 || event.which == 16) {
                    _.Stop(event);
                } else if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
                    if (setting.float) {
                        if (value.value) _.KeyFloatValidation(setting, value.value, value, event, this, _);
                    } else if (!setting.float) {
                        if (value.value) _.KeyIntergerValidation(setting, value.value, value, event, this, _);
                    }
                } else if ([8, 13, 27, 37, 38, 39, 40, 46,9].indexOf(event.which) > -1) {
                    return true;
                } else {
                    _.Stop(event);
                }
            } else {
                _.Stop(event);
            }






        },
        findScope: function (s, value, setting, element, _, e) {
            var obj = {
                res: true,
                model: {},
                value: ""
            };
            if (s.hasOwnProperty(value[0])) {
                obj.model = s[value[0]];
            } else if (s.$parent.hasOwnProperty(value[0])) {
                obj.model = s.$parent[value[0]];
            } else {
                obj.res = false;
            }
            obj.value = obj.model[value[1]] && obj.model[value[1]] != 0 ? obj.model[value[1]].toString() : _.InputValueZeroUndefined(setting, obj.model[value[1]], _, e, obj);

            return obj
        },
        InputValueZeroUndefined: function (setting, value, _, e, obj) {
            var regexzeros = /^0+\,*0*$/g;
            value = value == undefined ? 'undefined' : value.toString().trim();
            if (regexzeros.test(value) || value == 'undefined') {
                if (!setting.zeros && regexzeros.test(value)) {
                    _.Stop(e);
                } else if (value == 'undefined' && setting.default != '') {
                    return setting.default;
                } else if (value == 'undefined') {
                    return '';
                } else if (/^0*$/g.test(value)) {
                    value = "0";
                }
                return value;
            }

        },
        PrefixSubfix: function (setting, text, obj) {
            if (setting.prefix && setting.PCharacter != '' && text.indexOf(setting.PCharacter) != -1) {
                text = text.replace(setting.PCharacter, '');
            }
            if (setting.subfix && setting.SCharacter != '' && text.indexOf(setting.SCharacter) != -1) {
                text = text.replace(setting.SCharacter, '');
            }
            obj.value = text;
            obj.res = true;
            return obj;
        },
        Stop: function (e) {
            e.preventDefault();
            return false;
        },
        KeyFloatValidation: function (setting, text, obj, e, _this, _) {
            var cursor = _this.children[0].children[0].selectionStart;
            var coma = text.indexOf(',');
            var _break = text.indexOf(',') != -1 ? text.split(',') : [text, ""];
            var regexzeros = /^0+\,*0*$/g;

            if (coma != -1 && cursor > coma) {
                if (_break[1].length > setting.afterComa - 1) {
                    _.Stop(e);
                }
            } else {
                if (setting.miles && _break[0] != '') _break[0] = _break[0].replace(/\./g, '');
                if (_break[0].length > setting.beforecoma - 1 || regexzeros.test(text) || regexzeros.test(_break[0])) {
                    _.Stop(e);
                }

            }

            obj.value = _break[0] + "," + _break[1]
            obj.res = true;
            return obj;
        },
        KeyIntergerValidation: function (setting, text, obj, e, elemnt, _) {
            if (setting.miles && text != '') text = text.replace(/\./g, '');
            text = parseInt(text).toString();
            if (text.length > setting.beforecoma - 1) {
                _.Stop(e);
            }
            obj.value = text
            obj.res = true;
            return obj;
        },
        EliminarCaracteresNoNumericos: function (setting, text, obj) {
            if (text && text.indexOf('.') != -1) obj.value = text.replace(/\./g, '');
            return obj;
        },
        BlurFloatValidation: function (text, obj, setting, _) {

            obj.value = text.toString().indexOf(',') != -1 ? parseFloat(text.replace(/\,/, '.')) : (text * 1);
            obj.value = text == "" ? "" : obj.value.toFixed(setting.decimal);
            obj.value = obj.value.replace(/\./, ",");

            if (setting.miles) {
                obj = _.PuntosMiles(obj.value, obj, setting);
            }
            return obj;
        },
        BlurIntegerValidation: function () {

        },
        PuntosMiles: function (text, obj, setting) {
            var txt = "";
            var _break = text.split(',');
            var counter = _break[0].length
            if (counter > 3) {
                txt = _break[0].split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
                txt = txt.split('').reverse().join('').replace(/^[\.]/, '');
            } else {
                txt = _break[0];
            }

            obj.value = (setting.float) ? txt + "," + _break[1] : txt;
            return obj;
        },
        Init: function (value) {
            if (value == undefined || value.toString() == "") return;
            
            var txt = "";
            if (!$scope.Setting.float) {
                txt = value.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
                txt = txt.split('').reverse().join('').replace(/^[\.]/, '');
                
            } else {
                value = value.toFixed($scope.Setting.decimal);
                var _break = value.toString().replace(/\./, ',').split(',');
                txt = _break[0].split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
                txt = txt.split('').reverse().join('').replace(/^[\.]/, '');
                txt = txt + "," + _break[1];
            }
            $scope.model = txt
        }
        
    }

    $scope.actualizarModelo = function (modelo, id) {
        var m = modelo.split('.');
        $scope.$parent[m[0]][m[1]] = document.querySelector("#" + id + " input").value;
    }

    $scope.Methods.Init($scope.model);

}








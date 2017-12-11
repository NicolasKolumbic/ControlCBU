angular
    .module('myApp', [])
    .directive('controlCbu',
        function ($compile) {
            return {
                restrict: 'E',
                scope: {
                    id: '@',
                    model: '=',
                    ngClass: '=?',
                    required: '=?',
                    readonly: '=?',
                    label: '@',
                    cssclass: '@',
                    setdisabled: '=?',
                    typeError: "@?",
                    errorMarked:"=?",
                    onBlur: "=?",
                    buildComplete: "=?",
                    labelClass: "@?",
                    inputContentClass: "@?",
                   
                },
                templateUrl: './controlCBU.html',
                link: function (scope, elm, attrs) {
                 
                    var CbuControl = scope.$parent.CbuControl;

                    if(!CbuControl.prototype.hasOwnProperty('Required')){

                        CbuControl.prototype.Disabled = function(value){
                            this.scope.setdisabled = value;
                            
                        }
    
                        CbuControl.prototype.IsDisabled = function(value){
                            return !!this.scope.setdisabled;
                        }
    
                        CbuControl.prototype.IsRequired = function(value){               
                            return !!this.scope.required;                          
                        }
                
                        CbuControl.prototype.Required = function(value){
                                this.scope.required = value;       
                        }

                        CbuControl.prototype.AddClass = function(str){
                            this.scope.cssclass += " "+str;
                        }

                        CbuControl.prototype.RemoveClass = function(str){
                            this.scope.cssclass = this.scope.cssclass.replace(str,"");
                        }
                    }

                    var _newCbuControl = new CbuControl();
                    _newCbuControl.node = document.getElementById(attrs.id);
                    _newCbuControl.value = scope.model;
                    _newCbuControl._model = attrs.model;
                    _newCbuControl._id = attrs.id;
                    _newCbuControl.scope = scope;

                    scope.$parent.$parent[attrs.id] = _newCbuControl;

                    scope.Setting.modelName = attrs.model;

                    if (scope.Setting.disabled) elm.find("input").prop('disabled', true);

                    elm.on('keydown', function (event) {
                        scope.Methods.keyUp.call(this, event);
                    })
                   
                    elm.find('input').on('blur', function (event) {
                        scope.Methods.blur.call(this, event);
                    });
                  
                    if(scope.buildComplete) scope.buildComplete();
                  
                   

                },
                controller: CBUcontroller,
            };
        });

function CBUcontroller($scope) {

      var CONSTANTES = {
        regexZeros: /^(0+\,*0*)|(0+\.*0*)$/g,
        ERRORS: {
            CARACTERES: ": Un CBU debe tener 22 dígitos.",
            NUMEROBANCO: ": El número del banco es incorrecto.",
            NUMEROCUENTA: ": El número de la cuenta es incorrecto.",
            OBLIGATORIO: ": El campo es obligatorio.",
            START: "Formato incorrecto"
        },
        TYPESERRORS: {
            DOWN: "CCBU-down-error",
            INLINE: "CCBU-inline-error",
            TOOLTIP: "CCBU-tooltip-error"
        }
    }

    if(angular.isUndefined($scope.id)){
        console.error("Debe definirse un id para el control.");
    }



    $scope.model = angular.isUndefined($scope.model)?"": $scope.model;
    $scope.ngclass = angular.isUndefined($scope.ngclass)?"": $scope.ngclass;
    $scope.required = angular.isUndefined($scope.required)?false: $scope.required;
    $scope.readonly = angular.isUndefined($scope.readonly)?false: $scope.readonly;
    $scope.label = angular.isUndefined($scope.label)?"": $scope.label;
    $scope.cssclass = angular.isUndefined($scope.cssclass)?"": $scope.cssclass;
    $scope.setdisabled = angular.isUndefined($scope.setdisabled)?false: $scope.setdisabled;
    $scope.typeError = angular.isUndefined($scope.typeError)?CONSTANTES.TYPESERRORS.DOWN : CONSTANTES.TYPESERRORS[$scope.typeError.toUpperCase()];
    $scope.onBlur = angular.isUndefined($scope.onBlur)?null: $scope.onBlur;
    $scope.buildComplete = angular.isUndefined($scope.buildComplete)?null: $scope.buildComplete;
    $scope.errorMessage = angular.isUndefined($scope.errorMessage)?"": $scope.errorMessage;
    $scope.errorMarked = angular.isUndefined($scope.errorMarked)?"": $scope.errorMarked;
    $scope.labelClass = angular.isUndefined($scope.labelClass)?"col-xs-12 col-sm-12 col-md-2 col-lg-2":$scope.labelClass;
    $scope.inputContentClass = angular.isUndefined($scope.inputContentClass)?"col-xs-12 col-sm-12 col-md-10 col-lg-10":$scope.inputContentClass;
    
    $scope.Setting = {
        modelName: "",
        typeError: $scope.typeError
 
    };

   

    if ($scope.hasOwnProperty("$parent") && !$scope.$parent.hasOwnProperty("CbuControl")) {

         // Clase privada de solo acceso dentro del controller Angular
        $scope.$parent.CbuControl = function () {
                this.value = "";
                this.node = null;
                this.selector = "";
                this._id = "";
                this._valid = true;
                this._model = "";
                this.scope = null;
        };

        // Clase pública
        function CbuControlDev() { };

        CbuControlDev.prototype.Valid = function () {
            return _newCbuControl._valid;
        };

        //
        CbuControlDev.prototype.ShowCalc = function(){
            var sentences = $scope.Methods.StringCalc.split(',');
            sentences.forEach(function(line,i){
                var msg = line.split(':');
                console.log("%c"+msg[0]+":%c"+msg[1],"color:#4B82C5;","color:#DA695E;");
            })
            
        }

        window.CbuControlDev = new CbuControlDev();

    }


    $scope.showError = false;
    $scope.message = "Formato incorrecto";



    $scope.Methods = {
        StringCalc: "",
        blur: function (event) {
            var _ = $scope.Methods;
            var setting = $scope.Setting;
            var instance = $scope.$parent[$scope.id];
            var m = setting.modelName.split(".");
            var value = _.findScope($scope, m, setting, this, _, event);
            var splitModel = function () {
                m.length > 1 ? $scope.$parent[m[0]][m[1]] = "" : $scope.$parent[m[0]] = "";

            }
           
            if (value.value != undefined && value.res && !/\<\!\>/.test(value.value.toString())) {

                value = _.EliminarCaracteresNoNumericos(setting, value.value, value);
               

                if (value.value != "") {
                    if (!$scope.Methods.Validate(value.value,true,$scope.id)){
                        instance._valid = false;
                        return false;
                    } 
                    $scope.$apply(function () {
                        $scope.message = CONSTANTES.ERRORS.START;
                        $scope.showError = false;
                    });
                    instance._valid = true;
                }else if(value.value.length == 0 && $scope.required){
                    $scope.Methods.ShowError(CONSTANTES.ERRORS.OBLIGATORIO,true);
                    return false;
                }
            } else if (value.value == "" && !value.res) {
                this.value = "";
                $scope.$apply(splitModel);
                $scope.showError = false;
                return;
            }

            this.value = value.value != undefined ? value.value : "";
            $scope.actualizarModelo(setting.modelName, $scope.id);

            if ($scope.onBlur != null && typeof $scope.onBlur == "function") {
               
                $scope.onBlur(instance.node, value.value);

            }


        },
        keyUp: function (event, ModelCtrl) {

            var _ = $scope.Methods;
            var setting = $scope.Setting;
            var value = _.findScope($scope, setting.modelName.split("."), setting, this, _, event);

            if (value.res) {

                if (event.shiftKey) {
                    _.Stop(event);
                }
                if (event.which == 64 || event.which == 16) {
                    _.Stop(event);
                } else if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105) || ([8, 13, 27, 37, 38, 39, 40, 46, 9].indexOf(event.which) > -1)) {
                    return true;
                } else {
                    _.Stop(event);
                }
            } else if (!value.res && /96|48/.test(event.which.toString())) {

                var cursor =  this.children[0].children[1].children[0].selectionStart;
                var end =  this.children[0].children[1].children[0].selectionEnd;
                var v = this.children[0].children[1].children[0].value;
                

                  

                


            } else if ((value.value == "" && !value.res) || (value.value == "0," && (event.which == 188 || event.which == 44)) || (!value.res && !setting.zeros && /96|48/.test(event.which.toString()))) {
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
                obj.model = typeof s.$parent[value[0]] == 'object' ? s.$parent[value[0]] : s.$parent;
            } else {
                obj.res = false;
            }

            obj.value = obj.model[!value[1] ? value[0] : value[1]].toString();
      
            if ((obj.value == "" && e == undefined)) {
                obj.res = false;
                obj.value = "";
            }
            return obj
        },
        InputValueZeroUndefined: function (setting, value, _, e, obj) {
            value = value == undefined ? 'undefined' : value.toString().trim();
            if (CONSTANTES.regexZeros.test(value) || value == 'undefined') {
                if (!setting.zeros) {

                    value = e.type == "keydown" ? value : "";
                    obj.res = false;

                }
                if (value == 'undefined') {
                    value = setting.default != '' ? setting.default != '' : "";
                }
            }
            return value;

        },
        Stop: function (e) {
            e.preventDefault();
            return false;
        },
        EliminarCaracteresNoNumericos: function (setting, text, obj) {
            if (text && text.indexOf('.') != -1) obj.value = text.replace(/\./g, '');
            return obj;
        }, 
        Validate: function (cbu,flag,id) {

            // valida largo del CBU
            this.StringCalc = "";
            this.StringCalc += "El control con ID: "+id+",";
            this.StringCalc += "El cbu: "+cbu+",";
            this.StringCalc += "El control contiene: "+cbu.length+" carácteres,";

           

            if (cbu.length != 22) {
                $scope.Methods.ShowError(CONSTANTES.ERRORS.CARACTERES,flag);
                return false;
            }

            // valida codigo Banco
            var codigoBanco = cbu.substr(0, 8);

            if (codigoBanco.length != 8) {
                $scope.Methods.ShowError(CONSTANTES.ERRORS.NUMEROBANCO,flag);
                return false
            }

            var banco = codigoBanco.substr(0, 3);
            var digitoVerificador1 = codigoBanco[3];
            var sucursal = codigoBanco.substr(4, 3);
            var digitoVerificador2 = codigoBanco[7];

            this.StringCalc += "El control contiene el código banco: "+banco+",";
            this.StringCalc += "El Código Verificador del Banco es: "+digitoVerificador1+",";
            this.StringCalc += "El control contiene el código de Sucursal: "+sucursal+",";
           

            var suma = banco[0] * 7 + banco[1] * 1 + banco[2] * 3 + digitoVerificador1 * 9 + sucursal[0] * 7 + sucursal[1] * 1 + sucursal[2] * 3

            this.StringCalc += "Suma > Calculo Banco: ("+banco[0]+" x 7) + (" + banco[1]+" * 1) + (" + banco[2]+" x 3) + (" + digitoVerificador1+" x 9) + (" + sucursal[0]+" x 7) + ("+sucursal[1]+" x 1) + ("+sucursal[2]+" x 3),";
            this.StringCalc += "Suma > Calculo Banco: "+suma+",";
            
            var diferencia = 10 - ((suma % 10) == "0"?10:(suma % 10));
            
            this.StringCalc += "Direferencia > Calculo Banco: 10 - "+((suma % 10) == "0"?10:(suma % 10))+",";
            this.StringCalc += "Direferencia > Calculo Banco:"+diferencia+",";
            this.StringCalc += "Comparacion:"+diferencia+" == "+digitoVerificador2+",";
            this.StringCalc += "Valido:"+(diferencia == digitoVerificador2)+",";
            
            if (diferencia != digitoVerificador2) {
                $scope.Methods.ShowError(CONSTANTES.ERRORS.NUMEROBANCO,flag);
                return false;
            }

            //valida la cuenta
            var cuenta = cbu.substr(8, 14);

            
            this.StringCalc += "El control contiene: "+cuenta.length+" carácteres,";

            if (cuenta.length != 14) {
                return false
            }

            var digitoVerificador = cuenta[13]
            var suma2 = cuenta[0] * 3 + cuenta[1] * 9 + cuenta[2] * 7 + cuenta[3] * 1 + cuenta[4] * 3 + cuenta[5] * 9 + cuenta[6] * 7 + cuenta[7] * 1 + cuenta[8] * 3 + cuenta[9] * 9 + cuenta[10] * 7 + cuenta[11] * 1 + cuenta[12] * 3
            var diferencia2 = 10 - ((suma2 % 10) == "0"?10:(suma2 % 10));

            this.StringCalc += "El cuenta: "+cuenta+",";
            this.StringCalc += "El Digito Verificador de la Cuenta es: "+digitoVerificador+",";

            this.StringCalc += "Suma > Calculo Cuenta: ("+cuenta[0]+" x 3) + (" + cuenta[1]+" x 9) + (" + cuenta[2]+" x 7) + (" + cuenta[3]+" x 1) + (" + cuenta[4]+" x 3) + (" + cuenta[5]+" x 9) + (" + cuenta[6]+" x 7) + (" + cuenta[7]+" x 1) + (" + cuenta[8]+" x 3) + (" + cuenta[9]+" x 9) + (" + cuenta[10]+ "x 7) + ("+cuenta[11]+" x 1) + (" + cuenta[12]+ " x 3),";
            this.StringCalc += "Suma > Calculo Cuenta: "+suma2+",";
            this.StringCalc += "Diferencia Cuenta: "+diferencia2+",";
            this.StringCalc += "Comparacion:"+diferencia2+" == "+digitoVerificador+",";
            this.StringCalc += "Valido:"+(diferencia2 == digitoVerificador);
           
           

            if (diferencia2 != digitoVerificador) {
                $scope.Methods.ShowError(CONSTANTES.ERRORS.NUMEROBANCO,flag);
                return false;
            }

            return true;



        },  
        ShowError: function (msg,flag) {
                var executeError = function(){
                    $scope.message = CONSTANTES.ERRORS.START+msg;
                    $scope.showError = true;
                   
                };         
                try{
                   flag? $scope.$apply(executeError):executeError();
                }catch(e){
                    console.error(e);
                }
        },
        Init: function (value) {
            if (value == undefined || value.toString() == "") return;

            value = value.toString();

            if (CONSTANTES.regexZeros.test(value) || !$scope.Methods.Validate(value),undefined,$scope.id) {
                return false;
            }
            $scope.model = value
          
        }
      
    }

    $scope.actualizarModelo = function (modelo, id) {

        var m = modelo.split('.');
        var value = document.querySelector("#" + id + " input").value;
        if (m.length == 1)
            $scope.$parent[m[0]] = value;
        else if (m.length == 2) {
            $scope.$parent[m[0]][m[1]] = value;
        }
       

    }



    $scope.Methods.Init($scope.model);

}
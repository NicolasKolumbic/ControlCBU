angular
    .module('controles.ceempleadoresas', ['datatables'])
    .controller('empleadorCtrl', empleadorCtrl)
    .directive('controlCeempleadoresas', function () {
        return {
            restrict: 'E',
            scope: { objempleador: "=", dblclik: "&dobleClick" },
            link: function (scope, elem, attrs) {

                scope.checkEmpleador = function (oEmpleador)
                {
                    scope.objempleador = oEmpleador;
                }

                scope.dobleClick = function (oEmpleador)
                {
                    scope.objempleador = oEmpleador;

                    if (typeof (scope.dblclik) == 'function') {
                        scope.dblclik();
                    }
                }

            },
            templateUrl: 'Areas/ASDirect_WebControls/Content/CEEmpleadoresAS/CEEmpleadoresAS.html'
        };
    });

function empleadorCtrl($scope, srvWebAsociart, DTColumnDefBuilder, DTOptionsBuilder, notify) {

    // Configuración de las Tablas 
    {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('simple')
            .withOption('lengthChange', false)
            .withOption('searching', false)
            .withOption('aaSorting',[])
            .withDisplayLength(5);

        $scope.dtColumns = [
            DTColumnDefBuilder.newColumnDef(0),
            DTColumnDefBuilder.newColumnDef(1)
        ];
    }

    $scope.objEmpleadores = [];
    $scope.selectedRow = null;
    $scope.cEmpleador = { CuitEmpleador: "", RazonSocial: "" };
    // Métodos
    {

        $scope.buscar = function (empleador) {

            if (empleador.RazonSocial.length < 3) {
                notify({
                    message: "Ingrese por le menos 3 caracteres en el cuadro de texto Razón Social.",
                    classes: "alert-danger",
                    templateUrl: $scope.inpiniaTemplate,
                    position: "right"
                });
            }
            else {
                srvWebAsociart.callWS('Api/ASDirect_WebControls/SrvCEEmpleadoresAS/BuscarEmpleadores', 'post', empleador)
                .then(function (data) {
                    $scope.objEmpleadores = data.data;
                });
            }
        };

        $scope.setClickedRow = function (index) {
            $scope.selectedRow = index;
        };
    }
};


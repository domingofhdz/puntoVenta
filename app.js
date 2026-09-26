function debounce(fun, delay) {
    let timer
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(function () {
            fun.apply(this, args)
        }, delay)
    }
}

const app = angular.module("angularjsApp", ["ngRoute"])
app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("")

    $routeProvider
    .when("/", {
        templateUrl: "views/login.html",
        controller: "loginCtrl"
    })
    .when("/productos", {
        templateUrl: "views/productos.html",
        controller: "productosCtrl"
    })
    .when("/ventas", {
        templateUrl: "views/ventas.html",
        controller: "ventasCtrl"
    })
    .when("/ventas/:id", {
        templateUrl: "views/venta.html",
        controller: "ventaCtrl"
    })
    .otherwise({
        redirectTo: "/"
    })
})
app.run(["$rootScope", "$location", "$timeout", function($rootScope, $location, $timeout) {
    $rootScope.login = localStorage.getItem("jwt")

    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        const path      = current.$$route.originalPath
        $rootScope.path = path

        $.extend($.validator.messages, {
            required: "Llena este campo",
            number: "Solo números",
            digits: "Solo números enteros",
            min: $.validator.format("No valores menores a {0}"),
            max: $.validator.format("No valores mayores a {0}"),
            minlength: $.validator.format("Mínimo {0} caracteres"),
            maxlength: $.validator.format("Máximo {0} caracteres"),
            rangelength: $.validator.format("Solo {0} caracteres"),
            equalTo: "El texto de este campo no coincide con el anterior",
            date: "Ingresa fechas validas",
            email: "Ingresa un correo electrónico valido"
        })

        $.ajaxSetup({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`
            }
        })

        const api = "http://localhost/test/pwas/app2/puntoVenta/api"

        $.get(`${api}/?sesion`, function (sesion) {
            if (sesion.length) {
                // Si inició sesión
                if (location.hash == "#/") {
                    window.location = "#/productos"
                }
                $rootScope.login = true

                return
            }

            // Si no inició sesión
            // Podrías añadir un redireccionamiento si lo crees prudente
            if (location.hash != "#/") {
                window.location = "#/"
            }
            $rootScope.login = false
            localStorage.removeItem("jwt")
        })

        $(".btn-cerrar-sesion")
        .off()
        .click(function (event) {
            $timeout(function () {
                localStorage.removeItem("jwt")
                window.location = "#/"
                $rootScope.login = false
            })
        })

        function pageshow(event) {
            if (event.persisted) {
                if (!localStorage.getItem("jwt")) {
                    window.location = "#/"
                }
                else {
                    location.reload()
                }
            }
        }

        window.removeEventListener("pageshow", pageshow)
        window.addEventListener("pageshow", pageshow)
    })
    $rootScope.$on("$routeChangeError", function () {
    })
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
    })
}])

app.controller("loginCtrl", function ($scope) {
    const api = "http://localhost/test/pwas/app2/puntoVenta/api"

    $("#frmLogin")
    .off()
    .submit(function (event) {
        event.preventDefault()
    
        // Endpoint combinado con la API para iniciar sesión
        $.post(`${api}/?iniciarSesion`, $(this).serialize(), function (respuesta) {
            if (respuesta == "error") {
                alert("Usuario y/o contraseña incorrecto(s)")
                return
            }

            // Guarda el JWT en un almacenamiento persistente
            localStorage.setItem("jwt", respuesta)
            // Cambia el redireccionamiento según tu aplicación web
            window.location = "#/productos"
        })
    })
})

app.controller("productosCtrl", function ($scope, $timeout) {
    function buscar(busqueda) {
        $.get(`${api}/?buscarProductos`, {
            txtBusqueda: busqueda || ""
        }, function (productos) {
            $timeout(function () {
                $scope.productos = productos
            })
        })
    }

    const api = "http://localhost/test/pwas/app2/puntoVenta/api"

    $scope.productos = []

    buscar()

    $("#frmProducto")
    .off()
    .submit(function (event) {
        event.preventDefault()

        $("#frmProducto").valid()

        if (!validatorProducto.valid()) {
            return
        }

        $.post(`${api}/?guardarProducto`, $(this).serialize(), function (respuesta) {
            $("#frmProducto").get(0).reset()
            buscar()
        })
    })
    .on("reset", function (event) {
        // $(':hidden').val("")
    })

    const validatorProducto = $("#frmProducto").validate({
        errorClass: "is-invalid",
        validClass: "is-valid",
        rules: {
            txtNombreProducto: {required: true},
            txtPrecio: {required: true, number: true, min: 0},
            cboCategoria: {required: true}
        },

        errorPlacement: function(error, element) {
            if (element.get(0).type == "password") {
                error.insertAfter(element.get(0).parentNode)
            }
            else {
                error.insertAfter(element)
            }
        }
    })

    const buscarConDebounce = debounce(function (event) {
        buscar(event.target.value)
    }, 500)

    $("#txtBusqueda")
    .off()
    .on("input", buscarConDebounce)

    $(document)
    .off("click", ".btn-editar")
    .on("click", ".btn-editar", function (event) {
        const id = $(this).data("id")

        $.get(`${api}/?editarProducto`, {
            txtId: id
        }, function (productos) {
            const producto = productos[0]

            $("#txtId").val(producto.id)
            $("#txtNombreProducto").val(producto.nombreProducto)
            $("#txtPrecio").val(producto.precio)
            $("#cboCategoria").val(producto.categoria)
        })
    })

    $(document)
    .off("click", ".btn-eliminar")
    .on("click", ".btn-eliminar", function (event) {
        const id = $(this).data("id")

        if (!confirm("Quieres eliminar este registro?")) {
            return
        }

        $.post(`${api}/?eliminarProducto`, {
            txtId: id
        }, function (respuesta) {
            buscar()
        })
    })
})

app.controller("ventasCtrl", function ($scope, $timeout) {
    function buscar(busqueda) {
        $.get(`${api}/?buscarVentas`, {
            txtBusqueda: busqueda || ""
        }, function (ventas) {
            $timeout(function () {
                $scope.ventas = ventas
            })
        })
    }

    const api = "http://localhost/test/pwas/app2/puntoVenta/api"

    $scope.ventas = []

    buscar()

    $("#frmVenta")
    .off()
    .submit(function (event) {
        event.preventDefault()

        $.post(`${api}/?guardarVenta`, $(this).serialize(), function (respuesta) {
            $("#frmVenta").get(0).reset()
            buscar()
        })
    })
    .on("reset", function (event) {
        // $(':hidden').val("")
    })

    const buscarConDebounce = debounce(function (event) {
        buscar(event.target.value)
    }, 500)

    $("#txtBusqueda")
    .off()
    .on("input", buscarConDebounce)

    $(document)
    .off("click", ".btn-eliminar")
    .on("click", ".btn-eliminar", function (event) {
        const id = $(this).data("id")

        if (!confirm("Quieres eliminar este registro?")) {
            return
        }

        $.post(`${api}/?eliminarVenta`, {
            txtId: id
        }, function (respuesta) {
            buscar()
        })
    })
})

app.controller("ventaCtrl", function ($scope, $routeParams, $timeout) {
    function searchAutocompleteProductos() {
        $("#txtNombreProducto").autocomplete("search", $("#txtNombreProducto").val())
    }
    function autocompleteProductos() {
        if ($("#txtNombreProducto").val().length < 4) {
            return
        }
    
        $.get(`${api}/?autocompleteProductos`, {
            text: $("#txtNombreProducto").val()
        }, function (productos) {
            $("#txtNombreProducto").autocomplete("option", "source", productos)
            searchAutocompleteProductos()
        })
    }
    
    const autocompleteProductosConDebounce = debounce(autocompleteProductos, 500)

    $("#txtNombreProducto")
    .off()
    .on("input", autocompleteProductosConDebounce)
    .focus(searchAutocompleteProductos)
    $("#txtNombreProducto").autocomplete({
        source: [],
        minLength: 0,
        _renderItem: function (ul, item) {
            return $("<li>")
            .attr("data-value", item.value)
            .attr("data-label", item.label)
            .attr("data-precio", item.precio)
            .append(item.label)
            .appendTo(ul);
        },
        select: function (event, ui) {
            const item = ui.item
            $("#txtNombreProducto").val(item.label)
            $("#txtIdProducto").val(item.value)
            $("#txtPrecio").val(item.precio)
    
            event.preventDefault()
        },
        focus: function (event, ui) {
            const item = ui.item
            $("#txtNombreProducto").val(item.label)
            $("#txtIdProducto").val(item.value)
            $("#txtPrecio").val(item.precio)
    
            event.preventDefault()
        }
    })

    function cargarDetallesVenta() {
        $.get(`${api}/?venta`, {
            id: $routeParams.id
        }, function (detalles) {
            $timeout()
            $scope.detalles = detalles

            $scope.total = detalles.reduce(function (total, detalle) {
                return total + (detalle.precio * detalle.cantidad)
            }, 0)
        })

        $scope.total = 0
    }

    const api = "http://localhost/test/pwas/app2/puntoVenta/api"

    cargarDetallesVenta()

    $("#frmDetalleVenta")
    .off()
    .submit(function (event) {
        event.preventDefault()

        $.post(`${api}/?agregarDetalleVenta&idVenta=${$routeParams.id}`, $(this).serialize(), function (respuesta) {
            cargarDetallesVenta()
            $("#frmDetalleVenta").get(0).reset()
        })
    })
})

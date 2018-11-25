
/* Variables iniciales */
var form = $("")

var definitions = {
    stripe_secret_key:'sk_test_nd4jnnXjXZwLWlIamxDxReIT',
    stripe_public_key:'pk_test_DFRzhPdWG3hbxhOJ2DSiI7zW',
    stripe_product_id:'prod_E0jrZSc9mBYvfn'
}
var lastScreen = [];
var changeScreen,backScreen;
var amount;
var currentScreen = $("#donate-form").find('.screen_show').attr('id').replace('#','');
var donateFrequency = $("#donate-form").find('.amount_frequency_item input:checked').val();
var stripe = Stripe(definitions.stripe_public_key);

/* Funciones */
var updateAmount = function() {
	var am = $(".amount_list input:checked").val();
	if (am=='other') {
		am=$('#donate-amount-custom').val();
	}else {
		triggerCustomAmount(false);
	}
	$('.amount_button_val').html(am);
	amount = am
}
var triggerCustomAmount = function(enable) {
	if (enable) {
		$('.amount_other_panel').css("visibility", "visible");
	}else {
		$('.amount_other_panel').css("visibility", "hidden");
    }

}
var updatePreventa = function() {
	var radioId = $(".amount_list input:checked");
	if (radioId.length>0) {
		radioId= radioId.attr('id').split("-")[2];
    	$('.preventas').children().not('.preventa_'+radioId).hide().css("visibility", "hidden");
    	$('.preventa_'+radioId).show().css("visibility", "visible");
    }
}
var validateScreen = function() {
	var name = $('#donate-name');
	var lastname = $('#donate-lastname');
    var tel = $('#donate-phone');
	var email = $('#donate-email');
	var zip = $('#donate-zip');	
	if (currentScreen=='donate') {
		if (amount=="" || amount==undefined || isNaN(amount) || !donateFrequency) {
			$("#"+currentScreen+" .next_button").prop('disabled', true);
			return;

		}
	}else if(currentScreen=='personal_info') {
	   var pError = false;
	   if (name.val() == '') {
            name.addClass("input_error");
            //name.focus();
            pError = true;
        } else {
            name.removeClass("input_error");
            namePass = true;
        }
        if (lastname.val() == '') {
            lastname.addClass("input_error");
            //lastname.focus();
            pError = true;
           
        } else {
            lastname.removeClass("input_error");
            lastnamePass = true;
        }
        if (email.val() == '') {
            email.addClass("input_error");
            //email.focus();
            pError = true;
           
        } else {
            emailPass = validateInputEmail(email.val());
        }

        if (tel.val() == '') {
            tel.addClass("input_error");
            //tel.focus();
            pError = true;
           
        } else {
            tel.removeClass("input_error");
            telPass = true;
        }
        if (pError) {

    		$("#"+currentScreen+" .next_button").prop('disabled', true);
    		return;

        }
	}else if(currentScreen=='desgravacion') {
		var dError = false;
		var inputs = $('#desgravacion input').filter('[required]');
		inputs.filter(function() {
			return this.value;
		}).each(function(index,item) {
			$(item).removeClass("input_error");
			//$(item).focus();
		})
		inputs.filter(function() {
			return !this.value;
		}).each(function(index,item) {
			$(item).addClass("input_error");
			//$(item).focus();
			dError = true;
		})

		if (dError) {
			console.log('hay error');
		    $("#"+currentScreen+" .next_button").prop('disabled', true);
		    return;

		}

		

	}
	$("#"+currentScreen+" .next_button").prop('disabled', false);


}

var validateInputEmail  = function(emailVal) {

    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    var test = testEmail.test(emailVal);
    if (test) {
        $("#donate-email").removeClass("input_error");
        return test;
        
    } else {
        $("#donate-email").addClass("input_error");
        $("#donate-email").focus();
        return test;
    }
}
/* Routing */

//Next buttons
$(".next_button").click(function(e) {
	e.preventDefault();
	validateScreen();
});
$("#donate .next_button").click(function(e) {
    e.preventDefault();
    changeScreen('personal_info');
});

$("#desgravacion .next_button").click(function(e) {
    e.preventDefault();
    changeScreen('payment_method');
});
$("#personal_info .next_button").click(function(e) {
    e.preventDefault();
    let desgravacion = $('#desgravar_checkbox').is(':checked');
 
    if (desgravacion) {
        changeScreen('desgravacion');
    }else {
        changeScreen('payment_method');
    }
});

changeScreen = function(screen,isBack) {
    if (!screen) 
        return;
    if (!isBack)
    	lastScreen.push($("#donate-form").find('.screen_show').attr('id').replace('#',''));
    currentScreen = screen;
    $("#"+currentScreen+" .next_button").prop('disabled', true);
    $("#donate-form").children('.screen').not("#"+screen).removeClass('screen_show').addClass('screen_hidden');
    $("#donate-form").find("#"+screen).removeClass('screen_hidden').addClass('screen_show');
    validateScreen();
}
backScreen = function() {
    if (lastScreen.length>0) {
        changeScreen(lastScreen.pop(),true);
        //lastScreen = '';
    }
}
$('.back').click(function () {
    backScreen();
});

var evalNextButton = function() {

}
/*Inicializar */
/** TelInput */
var telInput = $('#donate-phone'),
    countryData = $.fn.intlTelInput.getCountryData(),
    errorMsg = $("#error-msg"),
    validMsg = $("#valid-msg"),
    addressDropdown = $("#donate-countries");

telInput.intlTelInput({
    dropdownContainer: "body",
    nationalMode: true,
    hiddenInput: "full_number",
    separateDialCode: true,
    formatOnDisplay: true,
    initialCountry: "auto",
    placeholderNumberType: "MOBILE",
    geoIpLookup: function(callback) {
        $.get('https://ipinfo.io', function() {}, "jsonp").always(function(resp) {
            var countryCode = (resp && resp.country) ? resp.country : "";
            callback(countryCode);
             addressDropdown.val(countryCode.toLowerCase());

        });
    },
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/13.0.4/js/utils.js"
});

// populate the country dropdown
$.each(countryData, function(i, country) {
    addressDropdown.append($("<option></option>").attr("value", country.iso2).text(country.name));
});



// set it's initial value
//var initialCountry = telInput.intlTelInput("getSelectedCountryData").iso2;


var reset = function() {
    telInput.removeClass("input_error");
    errorMsg.addClass("hide");
    validMsg.addClass("hide");
};

// on blur: validate
telInput.blur(function() {
    reset();
    if ($.trim(telInput.val())) {
        if (telInput.intlTelInput("isValidNumber")) {
            validMsg.removeClass("hide");
        } else {
            telInput.addClass("input_error");
            errorMsg.removeClass("hide");
        }
    }
});

// on keyup / change flag: reset
telInput.on("keyup change", reset);

$("#"+currentScreen+" .next_button").prop('disabled', true);
updatePreventa();
updateAmount();
validateScreen();
/* Pagina donar */


/* eventos */
$(document).ready(function() {

	$("#payment_type_select input[type=radio]").on("change",function() {
		console.log($(this).val());
		if ($(this).val()=='domiciliacion') {
			$("#payment_domiciliacion").show();
			$("#payment_stripe").hide();
		}else if($(this).val()=='tarjeta') {
			$("#payment_domiciliacion").hide();
			$("#payment_stripe").show();
		}
	});
	$('#donate-name,#donate-lastname,#donate-phone,#donate-email,#donate-zip').on("keyup change", function () {
		validateScreen();
	});
	$('#desgravacion input').filter('[required]').on("keyup change",function() {
		validateScreen();
	})
	$('input:radio[name=amount]').on("change", function () {
	    // Set buttons message with this value
	   	
	    if ($(this).val() == 'other') {
	       triggerCustomAmount(true);
	       
	    } else {
	        triggerCustomAmount(false);
	        $('#error_explanation').removeClass('visible');
	        $('.amount_button').prop('disabled', false);
	    } 
	    updateAmount();
	    updatePreventa();
	    validateScreen();
	});

	$('#donate-amount-custom').on("change keyup copy",function(e) {
		e.preventDefault();
		
		var charCode = (e.which) ? e.which : e.keyCode
	    if (!charCode > 31 && (charCode < 48 || charCode > 57)) {
	    	validateScreen();
	    	return;
	    }


	    var customAmount = parseFloat(this.value);
	     if (isNaN(customAmount)) {

	     	amount = undefined;
	     	updateAmount();
	        $('#error_explanation').addClass('visible');
	        $('#error_explanation').html('<span>Por favor ingrese un número válido.</span>');
	        validateScreen();
	        return;
	    }

	    else if (customAmount < 1) {

	    	amount = undefined;
	    	updateAmount();
	        $('#error_explanation').addClass('visible');
	        $('#error_explanation').html('<span>El valor mínimo de tu donación es de 1</span>');
	        validateScreen();
	        return;
	    }
	    $('#error_explanation').removeClass('visible');

	    
	    updateAmount($('#donate-amount-custom').val());
		validateScreen();
	})
})



/* STRIPE */

        /* Elements ***/


        var elements = stripe.elements({
            fonts: [
                {
                    cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
                },
            ],
            // Stripe's examples are localized to specific languages, but if
            // you wish to have Elements automatically detect your user's locale,
            // use `locale: 'auto'` instead.
            locale: definitions.locale //window.__exampleLocale
        });

        // var definitions = {
        //   color: '#1b1b1b'
        // };

        let style = {
                base: {
                    iconColor: definitions.color,
                    color: definitions.color,
                    fontWeight: 500,
                    fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                    fontSize: '16px',
                    fontSmoothing: 'antialiased',

                    ':-webkit-autofill': {
                        color: definitions.color,
                    },
                    '::placeholder': {
                        color: '#525f7f',
                    },
                },
                invalid: {
                    iconColor: '#c74242',
                    color: '#c74242',
                },
            }
     //   var card = elements.create('card', {
       //     iconStyle: 'solid',
         //   style
       // });

        var cardNumberElement = elements.create('cardNumber', {
          style: style,
          placeholder:'Tarjeta*'
        });
        cardNumberElement.mount('#card-number-element');

        var cardExpiryElement = elements.create('cardExpiry', {
          style: style,
          placeholder: 'Fecha MM/AA'
        });
        cardExpiryElement.mount('#card-expiry-element');

        var cardCvcElement = elements.create('cardCvc', {
          style: style,
          placeholder:'CVV'
        });
        cardCvcElement.mount('#card-cvc-element');
        

        registerElements([cardNumberElement,cardExpiryElement,cardCvcElement], "#donate");

        /******/
        //$('.next_button').prop('disabled', true);


       // card.addEventListener('change', function(event) {
            //console.log('card', event);
         //   if (event.empty || event.error != undefined) {
           //     $('.donate_button').prop('disabled', true);
            //} else if (event.complete) {
             //   $('.donate_button').prop('disabled', false);
           // }
        //});


        function registerElements(elements, componentName) {
            
            var form = document.querySelector("#donate-form");
            var error = form.querySelector('.error');
            var errorMessage = error.querySelector('.message');

            function enableInputs() {
                Array.prototype.forEach.call(
                    form.querySelectorAll(
                        "input[type='text'], input[type='email'], input[type='tel'], select"
                    ),
                    function (input) {
                        input.removeAttribute('disabled');
                    }
                );
            }

            function disableInputs() {
                Array.prototype.forEach.call(
                    form.querySelectorAll(
                        "input[type='text'], input[type='email'], input[type='tel'], select"
                    ),
                    function (input) {
                        input.setAttribute('disabled', 'true');
                    }
                );
            }

            // Listen for errors from each Element, and show error messages in the UI.
            var savedErrors = {};
            elements.forEach(function (element, idx) {
                element.on('change', function (event) {

                    if (event.error) {
                      
                        error.classList.add('visible');
                        savedErrors[idx] = event.error.message;
                        errorMessage.innerText = event.error.message;
                    } else {
                        
                        savedErrors[idx] = null;

                        // Loop over the saved errors and find the first one, if any.
                        var nextError = Object.keys(savedErrors)
                            .sort()
                            .reduce(function (maybeFoundError, key) {
                                return maybeFoundError || savedErrors[key];
                            }, null);

                        if (nextError) {
                            // Now that they've fixed the current error, show another one.
                            errorMessage.innerText = nextError;
                        } else {
                            // The user fixed the last error; no more errors.
                            error.classList.remove('visible');
                        }
                    }
                });
            });
		}

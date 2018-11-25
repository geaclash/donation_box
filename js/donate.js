
    'use strict';
    
    let definitions = {
        stripe_secret_key:'sk_test_nd4jnnXjXZwLWlIamxDxReIT',
        stripe_public_key:'pk_test_DFRzhPdWG3hbxhOJ2DSiI7zW',
        stripe_product_id:'prod_E0jrZSc9mBYvfn'
    }
    let lastScreen = '';
    let changeScreen,backScreen;

    $(document).ready(function () {

        $("#donate-amount-1").prop("checked", true);
        $("#donate-amount-custom").css("visibility", "hidden");
        $("#donate-amount-label").css("visibility", "hidden");
        $('.amount_other_input_label').css("visibility", "hidden");
        $('.amount_other_input').css("visibility", "hidden");
        if ($('.preventa')) { $('.preventa').css("visibility", "hidden"); }
        $('input:radio[name=amount]').bind("change", function () {
            console.log('click')
            // Set buttons message with this value
            if ($(this).val() != 'other') {
                $('.amount_button_val').html($(this).val());
            } else {
                $('.amount_button_val').html($('#donate-amount-custom').val());
            }


            if ($(this).val() == 'other') {
                

                $('.amount_other_input_label').css("visibility", "visible");
                $('.amount_other_input').css("visibility", "visible");
                $('.amount_other_input').focus();
                if (template1) {
                    $('.amount_button').prop('disabled', true);
                }
            } else {
                $('.amount_other_input_label').css("visibility", "hidden");
                $('.amount_other_input').css("visibility", "hidden");
                $('#error_explanation').removeClass('visible');
                $('.amount_button').prop('disabled', false);
            }

           
            var radioId = $(this).attr('id').split("-")[2];
            console.log("radioID",radioId)
            $('.preventas').children().not('.preventa_'+radioId).hide().css("visibility", "hidden");
            $('.preventa_'+radioId).show().css("visibility", "visible");
            
        });

        var componentName = 'donate';
        var stripe = Stripe(definitions.stripe_public_key);
        //var stripe = Stripe('pk_test_tjUqs0zHgOHZbmgwhGuNc4HG');

        /* Layout ***/
        var template1 = $('#' + componentName + '-template-1').length ? true : false;
        var template2 = $('#' + componentName + '-template-2').length ? true : false;

        var name = $('#' + componentName + '-name');
        var email = $('#' + componentName + '-email');
        var tel = $('#' + componentName + '-phone');

        console.log(name,email,tel)
        // Validade Custom amount
        $('#donate-amount-custom').bind("change paste keyup", function(e) {
            console.log('tre');
            e.preventDefault();

            if (/\D/g.test(this.value))
            {
                // Filter non-digits from input value.
                this.value = this.value.replace(/\D/g, '');
            }

            $('#error_explanation').removeClass('visible');
            //$('#error_explanation').html('');
            $('.amount_button').prop('disabled', false);

            var customAmount = $(this).val();

            $('.amount_button_val').html(customAmount);

            // amount = amount.replace(/\$/g, '').replace(/\,/g, '');

            customAmount = parseFloat(customAmount);

           
        });

        /** TelInput */
        var telInput = $('#' + componentName + "-phone"),
            countryData = $.fn.intlTelInput.getCountryData(),
            errorMsg = $("#error-msg"),
            validMsg = $("#valid-msg"),
            addressDropdown = $('#' + componentName + "-countries");

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
                    returnCountry(countryCode.toLowerCase());

                });
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/13.0.4/js/utils.js"
        });

        // populate the country dropdown
        $.each(countryData, function(i, country) {
            addressDropdown.append($("<option></option>").attr("value", country.iso2).text(country.name));
        });

        function returnCountry (c) {
            addressDropdown.val(c);
        }

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


        /**************** end TelInput */





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
        var card = elements.create('card', {
            iconStyle: 'solid',
            style
        });
        card.mount('#card');

        registerElements([card], componentName);

        /******/
        //$('.next_button').prop('disabled', true);


        card.addEventListener('change', function(event) {
            //console.log('card', event);
            if (event.empty || event.error != undefined) {
                $('.donate_button').prop('disabled', true);
            } else if (event.complete) {
                $('.donate_button').prop('disabled', false);
            }
        });


        function registerElements(elements, componentName) {
            var formClass = '.' + componentName;
            var component = document.querySelector(formClass);

            var form = component.querySelector('form');
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


            // Listen on the form's 'submit' handler...
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                $(this).focusout();
                // Show a loading screen...
                component.classList.add('submitting');

                // Disable all inputs.
                disableInputs();

                // Gather additional customer data we may have collected in our form.
                var name = form.querySelector('#' + componentName + '-name');
                var email = form.querySelector('#' + componentName + '-email');
                var zip = form.querySelector('#' + componentName + '-zip');
                var additionalData = {
                    name: name ? name.value : undefined,
                    email: email ? email.value : undefined,
                    address_zip: zip ? zip.value : undefined,
                };

                // Get all data from form input[name*='man']
                var amount = $("input[name='amount']:checked").val(),
                    frequency = $("input[name='frequency']:checked").val(),
                    custom = form.querySelector('#' + componentName + '-amount-custom'),
                    phone = form.querySelector("input[name='full_number']").value,
                    country = form.querySelector('#' + componentName + '-countries').value,
                    politic = form.querySelector('#' + componentName + '-politic').value,
                    locale = form.querySelector('#' + componentName + '-locale').value;


                // Start object to send to Server and Stripe
                var donorData = {
                    stripe_data: additionalData,
                    amount: amount,
                    frequency: frequency,
                    custom: custom ? custom.value : undefined,
                    phone: phone,
                    country: country,
                    politic: politic,
                    locale: locale,
                };

                //console.log("donorData", donorData);
                // console.log('validateAmount', validateAmount(donorData.amount, donorData.custom));


                // Use Stripe.js to create a token. We only need to pass in one Element
                // from the Element group in order to create a token. We can also pass
                // in the additional customer data we collected in our form.
                stripe.createToken(elements[0], additionalData).then(function (result) {

                    if (result.token) {

                        // If we received a token, show the token ID.
                        // POST AJAX
                        sendPostAjax(result.token.id, donorData, definitions.cur);

                    } else {
                        // Otherwise, un-disable inputs.
                        enableInputs();
                    }
                });
            });

            /** Functions  */

            function sendPostAjax(token, data, cur) {
                // console.log('stripeAdditionalData', JSON.stringify(data));
                let submit = {
                    customer: {
                        fullname: data.stripe_data.name,
                        email: data.stripe_data.email,
                        country: data.country,
                        phone: data.phone
                    },
                    detailsTransaction: {
                        currency: cur,
                        amount: data.amount === 'other' ? $("#donate-amount-custom").val() : data.amount,
                        payment_style: data.frequency
                    },
                    stripeToken: token
                }
                $.ajax({
                    url: '/donation/store/'+definitions.box_id,
                    method: 'POST',
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(submit)
                })
                    .done(function (msg) {
                        // console.log("success", msg);
                        // console.log("success", msg.resultado.status);
                        // console.log("success token", token);

                        if (msg.errorMessage) {
                            // Charge declined

                            // Show error message
                            component.classList.remove('submitting');
                            component.querySelector('.token').innerText = msg.errorMessage;
                            component.classList.add('submitted');
                        } else {
                            // Charge succeded
                            // Send Data to Facebook pixel @Donate
                            sendToFacebookPixel('Donate', definitions.campaign, cur, validateAmount(data.amount, data.custom), data.frequency);

                            // Go to success page
                            window.setTimeout(function () {
                                window.top.location.href = msg.message;
                            }, 1000);
                        }

                    })
                    .fail(function (jqXHR, textStatus) {
                        console.log("erroooo: " + JSON.stringify(textStatus));
                        // Stop loading!
                        component.classList.remove('submitting');
                        component.classList.add('submitted');
                        component.querySelector('.token').innerText = "Error, infelizmente no es posible procesar su donación.";

                    });
            }
        }
        // Validade Name input
        name.on("keyup change", function() {
            $(this).removeClass("input_error");
        });

        // Validade Email input
        $(email).on("keyup change", function() {
            validateInputEmail(this.value);
        });

        // Validade all inputs before show screen 2
        $('.amount_button').click(function () {

            // Put focus on Name input
            if (template1) {

                moveForwardScreen ();
                //name.focus();

            } else if (template2) {

                var namePass, emailPass, telPass;
        
                if (name.val() == '') {
                    name.addClass("input_error");
                    //name.focus();
                    return;
                } else {
                    name.removeClass("input_error");
                    namePass = true;
                }

                if (email.val() == '') {
                    email.addClass("input_error");
                    //email.focus();
                    return;
                } else {
                    emailPass = validateInputEmail(email.val());
                }

                if (tel.val() == '') {
                    tel.addClass("input_error");
                    //tel.focus();
                    return;
                } else {
                    tel.removeClass("input_error");
                    telPass = true;
                }
                
                if (namePass && emailPass && telPass) {
                    // Send Data dor Mautic
                    sendToMautic(name.val(), email.val(), definitions.locale);

                    // Send Data for Facebook pixel @AddToCart
                    sendToFacebookPixel ('AddToCart', definitions.campaign, definitions.cur);
                    moveForwardScreen ();
                }
            }


  
        });
        var preventaClass = $('input:radio[name=amount]:checked').attr('id').split("-")[2];
        $('.preventa_' + preventaClass).show();
        // Wacth input radio fields



        function validateInputEmail (emailVal) {
        
            var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
            var test = testEmail.test(emailVal);
            if (test) {
                $(email).removeClass("input_error");
                
                return test;
                
            } else {
                $(email).addClass("input_error");
                //$(email).focus();
                console.log('bad');
                return test;
            }
        }



        
        // Set button message with input radio value
        $('.amount_button_val').html($('input:radio[name=amount]:checked').val());

        

        $('.error_back').click(function() {
            window.location.reload();
           // $('.cell').removeClass('submitted');
        });

        $('#backButton').click(function () {
            moveForwardScreen ();
        });





            // resetButton.addEventListener('click', function(e) {
            //   e.preventDefault();
            //   // Resetting the form (instead of setting the value to `''` for each input)
            //   // helps us clear webkit autofill styles.
            //   form.reset();

            //   // Clear each Element.
            //   elements.forEach(function(element) {
            //     element.clear();
            //   });

            //   // Reset error state as well.
            //   error.classList.remove('visible');

            //   // Resetting the form does not un-disable inputs, so we need to do it separately:
            //   enableInputs();
            //   component.classList.remove('submitted');
            // });
         //registerElements
        function sendToMautic (name, email, locale) {
            var mauticUrl = 'https://marketing.acninternational.org';
            var pageURL = encodeURIComponent(window.top.location.href);
            var pageTitle = encodeURIComponent(document.title);
            var tags = 'tried-to-donate';
            var src = mauticUrl + '/mtracking.gif?page_url=' + pageURL + '&page_title=' + pageTitle + '&tags=' + tags + '&email=' + email + '&firstname=' + name + '&preferred_locale=' + locale;
            var img = document.createElement('img');
            img.style.width  = '1px';
            img.style.height  = '1px';
            img.style.display = 'none';
            img.src = src;
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(img);
        }

        function sendToFacebookPixel (track, name, cur, val , freq) {

            // track = AddToCart
            // track = Donate
            // track = Purchase

            // var pixelUrl = 'https://www.facebook.com/tr?id=',
            // pixelId = '151175745294544',
            // currency = cur,
            // value = val,
            // campaign = encodeURIComponent(name),
            // type = freq;

            fbq('track', track, { 
                content_type: freq,
                content_name: name,
                value: val,
                currency: cur
                });

            // var src = pixelUrl + pixelId + '&ev=' + track + '&cd[currency]=' + currency + '&cd[value]=' + value + '&cd[content_name]=' + campaign + '&cd[content_type]=' + type;
            // var img = document.createElement('img');
            // img.style.width  = '1px';
            // img.style.height  = '1px';
            // img.style.display = 'none';
            // img.src = src;
            // var body = document.getElementsByTagName('body')[0];
            // body.appendChild(img);
        }

        // Validade Amount for facebook pixel
        function validateAmount (amount, custom) {
            //Not send this to Stripe
            if (amount == 'other') {
                return parseFloat(custom).toFixed(2);
            } else {
                return parseFloat(amount).toFixed(2);
            }
        }

    }); // end Jquery    

(function($) {

	$(document).ready(function(e) {

		console.log($('[data-widget="apply"]'));

		$('[data-widget="apply"]').each(function(index, element) {

			var el = $(element);

			var controls = {

				modal: $('.modal', el),
				form: $('form', el),

				subject: $('form [name="subject"]', el),
				email: $('form [name="email"]', el),
				phone: $('form [name="phone"]', el),
				applicant: $('form [name="applicant"]', el),
				category: $('form [name="category"]', el),
				message: $('form [name="message"]', el),
			};

			controls.form.on('submit', function(e) {
				e.preventDefault();
				
				$.ajax({
					method: controls.form.attr('method'),
					url: controls.form.attr('action'),
					data: JSON.stringify({
						subject: controls.subject.val(),
						applicant: controls.applicant.val(),
						email: controls.email.val(),
						phone: controls.phone.val(),
						category: controls.category.val(),
						message: controls.message.val()
					}),
					contentType: "application/json",
				})
				.done(function(data) {
					controls.modal.modal('hide');
				})
				.fail(function(error) {
				});
			});
		});
	});

})(jQuery, undefined);
(function($, Vue, undefined) {

	$(document).ready(function() {

		$('[data-vue]').each(function(index, element) {

			console.log(element);

			new Vue({
				el: element,
				data: $(element).data()
			});
		})
	});

})(jQuery, Vue);

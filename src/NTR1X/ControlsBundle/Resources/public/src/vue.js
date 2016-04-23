(function($, Vue, undefined) {

	$(document).ready(function() {

		$('[data-vue]').each(function(index, element) {

			new Vue({
				el: element,
				data: $(element).data()
			});
		})
	});

})(jQuery, Vue);

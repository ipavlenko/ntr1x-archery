Vue.directive('rich', {

	bind: function () {
		
		if (window.CKEDITOR) {

			$(this.el).each(function (index, element) {
				
				CKEDITOR.inline(element, {
					stylesSet: [
						{ name: 'Bolder', element: 'span', attributes: { 'class': 'extrabold'} }
					],
					toolbarGroups: [
						// { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
						// { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
						{ name: 'links' },
						// { name: 'forms' },
						{name: 'tools'},
						{name: 'document', groups: ['mode', 'document', 'doctools']},
						{name: 'others'},
						{name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
						{name: 'colors'},
						'/',
						{name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
						{name: 'styles'},
						'/',
						{ name: 'insert', groups: [ 'ImageButton' ]  }
						//{name: 'about'}
					]
				});
			}.bind(this));
		}
	},
	update: function (newValue, oldValue) {
	},
	unbind: function () {
	}
});
<?php

namespace NTR1X\FormBundle\Form;

class FormBuilder {

	protected $fields;

	public function __construct(array $fields = array()) {
		$this->fields = $fields;
	}

	public function add($path, $type = FormField::TYPE_VALUE, array $attrs = array()) {
		$this->fields[$path] = new FormField($path, $type, $attrs);
		return $this;
	}

	public function addField(FormField $field) {
		$this->fields[$field->getPath()] = $field;
		return $this;
	}

	public function build() {
		return new Form($this->fields);
	}
}
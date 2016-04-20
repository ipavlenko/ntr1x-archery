<?php

namespace NTR1X\FormBundle\Form;

use NTR1X\FormBundle\Form\Transformer\TransformerInterface;

class FormField {

	const TYPE_VALUE = 1;
	const TYPE_ARRAY = 2;
	const TYPE_OBJECT = 3;

	public $path;
	public $type;
	public $attrs;

	public function __construct($path, $type = TYPE_VALUE, array $attrs = array()) {

		$this->path = $path;
		$this->type = $type;
		$this->attrs = $attrs;
	}

	public function getPath() { return $this->path; }
	public function getType() { return $this->type; }
	public function getAttrs() { return $this->attrs; }
}
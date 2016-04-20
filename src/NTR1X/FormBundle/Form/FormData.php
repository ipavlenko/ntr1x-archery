<?php

namespace NTR1X\FormBundle\Form;

use Symfony\Component\HttpFoundation\Request;

class FormData {

	public $fields;
	public $inputData;
	public $modelData;

	public function __construct(array $fields, array $inputData, array $modelData) {

		$this->fields = $fields;
		$this->inputData = $inputData;
		$this->modelData = $modelData;
	}
}
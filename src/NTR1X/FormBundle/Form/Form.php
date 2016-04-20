<?php

namespace NTR1X\FormBundle\Form;

use Symfony\Component\HttpFoundation\Request;

use Peekmo\JsonPath\JsonStore;

use NTR1X\FormBundle\Form\Context\RequestContext;
use NTR1X\FormBundle\Form\FormField;

class Form {

	private $fields;

	public function __construct(array $fields = array()) {
		$this->fields = $fields;
	}

	public function handleRequest(Request $request) {

		$context = (new RequestContext($request))->toArray();

		$inputData = [];
		$modelData = [];

		foreach ($this->fields as $path=>$field) {

            $store = new JsonStore($context);
            $result = $store->get($path);
            
            /*$store = new JsonStore();
			$result = $store->get($context, $path);*/

			switch ($field->type) {
				case FormField::TYPE_VALUE: $value = count($result) ? $result[0] : null; break;
				case FormField::TYPE_OBJECT: $value = count($result) ? $result[0] : null; break;
				case FormField::TYPE_ARRAY: $value = $result; break;
			}

			$transformer = @$field->attrs['transformer'];

			$model = $transformer == null
				? $value
				: $transformer->reverseTransform($value)
			;

			$inputData[$path] = $value;
			$modelData[$path] = $model;
		}

		return new FormData($this->fields, $inputData, $modelData);
	}

	public function createView($modelData) {

		$inputData = [];

		foreach ($this->fields as $path=>$field) {

			$transformer = @$field->attrs['transformer'];
			$model = $modelData[$path];

			$value = $transformer == null
				? $model
				: $transformer->transform($model)
			;

			$inputData[$path] = $value;
		}

		return new FormData($this->fields, $inputData, $modelData);
	}
}
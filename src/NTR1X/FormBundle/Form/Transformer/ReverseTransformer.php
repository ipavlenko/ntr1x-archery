<?php

namespace NTR1X\FormBundle\Form\Transformer;

class ReverseTransformer implements TransformerInterface {

	public function __construct($transformer) {
		$this->$transformer = $transformer;
	}

	public function transform($object) {
		return $this->transformer->reverseTransform($object);
	}

	public function reverseTransform($avatar) {
		return $this->transformer->transform($avatar);
	}
}
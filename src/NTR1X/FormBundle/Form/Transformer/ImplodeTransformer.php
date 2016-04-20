<?php

namespace NTR1X\FormBundle\Form\Transformer;

class ImplodeTransformer implements TransformerInterface {

	public $separator;

	public function __construct($separator = ',') {
		$this->separator = $separator;
	}

	public function transform($object) {

		if ($object === null) return null;
		if (is_array($object)) {
			return implode($this->separator, $object);
		}

		throw new TransformerException(sprintf("Argument is not suitable for the '%s' method", __METHOD__));
	}

	public function reverseTransform($avatar) {

		if ($avatar === null) return null;
		if (is_string($avatar)) {
			return explode($this->separator, $avatar);
		}

		throw new TransformerException(sprintf("Argument is not suitable for the '%s' method", __METHOD__));
	}
}
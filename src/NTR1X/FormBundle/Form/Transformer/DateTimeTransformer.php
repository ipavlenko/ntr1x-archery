<?php

namespace NTR1X\FormBundle\Form\Transformer;

class DateTimeTransformer implements TransformerInterface {

	public $format;

	public function __construct($format = 'Y-m-d') {
		$this->format = $format;
	}

	public function transform($object) {

		if ($object === null) return null;
		if ($object instanceof \DateTime) {
			return $object->format($this->format);
		}

		throw new TransformerException(sprintf("Argument is not suitable for the '%s' method", __METHOD__));
	}

	public function reverseTransform($avatar) {

		if (empty($avatar)) return null;
		if (is_string($avatar)) {
			$date = \DateTime::createFromFormat($this->format, $avatar);
			if ($date) {
				return $date;
			}
		}

		throw new TransformerException(sprintf("Argument is not suitable for the '%s' method", __METHOD__));
	}
}
<?php

namespace NTR1X\ApplyBundle\Form\Transformer;

use NTR1X\FormBundle\Form\Transformer\TransformerInterface;
use NTR1X\FormBundle\Form\Transformer\TransformerException;
use NTR1X\ApplyBundle\Entity\Apply;

class ApplyTransformer implements TransformerInterface {

	public $doctrine;

	public function __construct($doctrine) {
		$this->doctrine = $doctrine;
	}

	public function transform($object) {

		if ($object === null) return null;
		if ($object instanceof Apply) {
			return $object->getId();
		}

		throw new TransformerException(sprintf("Argument is not suitable for the '%s' method", __METHOD__));
	}

	public function reverseTransform($avatar) {

		if ($avatar === null) return null;
		if (is_numeric($avatar)) {
			return $this->doctrine
				->getRepository('NTR1XApplyBundle:Apply')
				->findOneById($avatar)
			;
		}

		throw new TransformerException(sprintf("Argument is not suitable for the '%s' method", __METHOD__));
	}
}
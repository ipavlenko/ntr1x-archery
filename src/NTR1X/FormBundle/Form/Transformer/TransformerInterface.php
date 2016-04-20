<?php

namespace NTR1X\FormBundle\Form\Transformer;

interface TransformerInterface {

	public function transform($object);
	public function reverseTransform($avatar);
}
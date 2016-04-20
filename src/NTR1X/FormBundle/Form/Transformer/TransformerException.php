<?php

namespace NTR1X\FormBundle\Form\Transformer;

class TransformerException extends \RuntimeException {

	public function __construct($message = "", $code = 0, Throwable $previous = NULL) {
		parent::__construct($message, $code, $previous);
	}
}
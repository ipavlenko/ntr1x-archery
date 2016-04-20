<?php

namespace NTR1X\SearchBundle\Decorator;

class DecoratorManager {

	private $decorators;

	public function register(DecoratorInterface $decorator) {
		$this->decorators[] = $decorator;
	}

	public function decorate($results) {

		$array = $results;

		foreach ($this->decorators as $decorator) {
			$array = $decorator->decorate($array);
		}

		return $array;
	}
}

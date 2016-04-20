<?php

namespace NTR1X\LayoutBundle\Component;

class ComponentManager {

	private $providers = [];

	public function register(ComponentProvider $provider) {
		$this->providers[] = $provider;
	}

	public function getStyles() {

		$array = [];
		foreach ($this->providers as $provider) {
			foreach ($provider->getComponents() as $component) {
				foreach ($component->getStyles() as $style) {
					$array[] = $style;
				}
			}
		}

		usort($array, function($a, $b) {

			$la = $a->getComponent()->getLevel();
			$lb = $b->getComponent()->getLevel();

			if ($la < $lb) return -1;
			if ($la > $lb) return 1;

			return 0;
		});

		// TODO Отфильтровать дубли
		return $array;
	}

	public function getScripts() {

		$array = [];
		foreach ($this->providers as $provider) {
			foreach ($provider->getComponents() as $component) {
				foreach ($component->getScripts() as $script) {
					$array[] = $script;
				}
			}
		}

		usort($array, function($a, $b) {

			$la = $a->getComponent()->getLevel();
			$lb = $b->getComponent()->getLevel();

			if ($la < $lb) return -1;
			if ($la > $lb) return 1;

			return 0;
		});

		// TODO Отфильтровать дубли
		return $array;
	}

	public function getTemplates() {

		$array = [];
		foreach ($this->providers as $provider) {
			foreach ($provider->getComponents() as $component) {
				foreach ($component->getTemplates() as $template) {
					$array[] = $template;
				}
			}
		}

		usort($array, function($a, $b) {

			$la = $a->getComponent()->getLevel();
			$lb = $b->getComponent()->getLevel();

			if ($la < $lb) return -1;
			if ($la > $lb) return 1;

			return 0;
		});

		// TODO Отфильтровать дубли
		return $array;
	}
}

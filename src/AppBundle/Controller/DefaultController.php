<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

class DefaultController extends Controller {

	/**
	 * @Route("/", name = "home")
	 */
	public function defaultAction(Request $request) {

		$data = (new FormBuilder())
			->add('$.get.c', FormField::TYPE_VALUE)
			->add('$.get.s', FormField::TYPE_VALUE)
			->add('$.get.t', FormField::TYPE_VALUE)
			->add('$.get.d', FormField::TYPE_VALUE)
			->build()
			->handleRequest($request)
		;

		$category = $this
			->getDoctrine()
			->getRepository('NTR1XMediaBundle:Category')
			->findOneByName(@$data->inputData['$.get.c']);

		$view = [

			'category' => $category,

			'search' => [
				'query' => [
					'category' => @$data->inputData['$.get.c'],
					'string' => @$data->inputData['$.get.s'],
					'tag' => @$data->inputData['$.get.t'],
					'date' => @$data->inputData['$.get.d'],
				],
			],
		];

		// replace this example code with whatever you need
		return $this->render('page-home.html.twig', $view);
	}

	/**
	 * @Route("/media", name = "media")
	 */
	public function mediaAction(Request $request) {

		$data = (new FormBuilder())
			->add('$.get.c', FormField::TYPE_VALUE)
			->add('$.get.s', FormField::TYPE_VALUE)
			->add('$.get.t', FormField::TYPE_VALUE)
			->add('$.get.d', FormField::TYPE_VALUE)
			->build()
			->handleRequest($request)
		;

		$category = $this
			->getDoctrine()
			->getRepository('NTR1XMediaBundle:Category')
			->findOneByName(@$data->inputData['$.get.c']);

		$view = [

			'category' => $category,

			'search' => [
				'query' => [
					'category' => @$data->inputData['$.get.c'],
					'string' => @$data->inputData['$.get.s'],
					'tag' => @$data->inputData['$.get.t'],
					'date' => @$data->inputData['$.get.d'],
				],
				'results' => [
					'title' => $category != null ? $category->getTitle() : null
				],
			],
		];

		// replace this example code with whatever you need
		return $this->render('page-media.html.twig', $view);
	}

	/**
	 * @Route("/media/i/{id}", name = "media-details")
	 */
	public function mediaDetailsAction(Request $request) {

		$data = (new FormBuilder())
			->add('$.path.id', FormField::TYPE_VALUE)
			->add('$.get.c', FormField::TYPE_VALUE)
			->add('$.get.s', FormField::TYPE_VALUE)
			->add('$.get.t', FormField::TYPE_VALUE)
			->add('$.get.d', FormField::TYPE_VALUE)
			->build()
			->handleRequest($request)
		;

		$category = $this
			->getDoctrine()
			->getRepository('NTR1XMediaBundle:Category')
			->findOneByName(@$data->inputData['$.get.c']);

		$view = [

			'category' => $category,

			'search' => [
				'query' => [
					'category' => @$data->inputData['$.get.c'],
					'string' => @$data->inputData['$.get.s'],
					'tag' => @$data->inputData['$.get.t'],
					'date' => @$data->inputData['$.get.d'],
				],
			],

			'tags' => $this
				->getDoctrine()
				->getRepository('NTR1XMediaBundle:Media')
				->findOneById($data->inputData['$.path.id']),

			'item' => $this
				->getDoctrine()
				->getRepository('NTR1XMediaBundle:Media')
				->findOneById($data->inputData['$.path.id']),
		];

		// replace this example code with whatever you need
		return $this->render('page-media-details.html.twig', $view);
	}
}

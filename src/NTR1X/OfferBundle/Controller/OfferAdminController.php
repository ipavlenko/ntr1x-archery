<?php

namespace NTR1X\OfferBundle\Controller;

use NTR1X\OfferBundle\Entity\Offer;
use NTR1X\OfferBundle\Entity\Tag;
use NTR1X\OfferBundle\Form\OfferFormFactory;
use NTR1X\OfferBundle\Form\Transformer\CategoryTransformer;
use NTR1X\OfferBundle\Form\Transformer\OfferTransformer;
use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;
use NTR1X\FormBundle\Form\Transformer\ImplodeTransformer;
use NTR1X\FormBundle\Form\Transformer\DateTimeTransformer;
use NTR1X\UploadBundle\Entity\Upload;
use NTR1X\SearchBundle\Entity\Search;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Extension\HttpFoundation\HttpFoundationExtension;

class OfferAdminController extends Controller {

	/**
	 * @Route("/admin/offer/i", name="admin-offer-items")
	 */
	public function listAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$view['category'] = $data->modelData['$.get.category'];
			$view['categories'] = $this
				->getDoctrine()
				->getRepository('NTR1XOfferBundle:Category')
				->findAll(['title'=>'asc'])
			;
			$view['items'] = $view['category'] == null
				? $this
					->getDoctrine()
					->getRepository('NTR1XOfferBundle:Offer')
					->findAll(['url'=>'asc'])
				: $this
					->getDoctrine()
					->getRepository('NTR1XOfferBundle:Offer')
					->findBy(['category' => $view['category']], ['url'=>'asc'])
			;
		});

		return $this->render('NTR1XOfferBundle:private-offer-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/offer/update", name="admin-offer-items-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new OfferTransformer($this->getDoctrine()) ])
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new OfferTransformer($this->getDoctrine()) ])
				->add('$.request.url', FormField::TYPE_VALUE)
				->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
				->add('$.files.image', FormField::TYPE_OBJECT)
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.url' => $item->getUrl(),
					'$.request.category' => $item->getCategory(),
					'$.files.image' => $item->getImage(),
				])
			;

			$view['category'] = $data->modelData['$.get.category'];
			$view['categories'] = $this
				->getDoctrine()
				->getRepository('NTR1XOfferBundle:Category')
				->findAll(['title'=>'asc'])
			;
		});
		
		return $this->render('NTR1XOfferBundle:private-offer-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/offer/create", name="admin-offer-items-create")
	 */
	public function createAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$view['form'] = (new FormBuilder())
				->add('$.request.url', FormField::TYPE_VALUE)
				->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
				->add('$.files.image', FormField::TYPE_OBJECT)
				->build()
				->createView([
					'$.request.url' => '',
					'$.request.category' => $data->modelData['$.get.category'],
					'$.files.image' => null,
				])
			;

			$view['category'] = $data->modelData['$.get.category'];
			$view['categories'] = $this
				->getDoctrine()
				->getRepository('NTR1XOfferBundle:Category')
				->findAll(['title'=>'asc'])
			;
		});
		
		return $this->render('NTR1XOfferBundle:private-offer-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/offer/do-create", name="admin-offer-items-do-create")
	 * @Method("POST")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.request.url', FormField::TYPE_VALUE)
			->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.files.image', FormField::TYPE_OBJECT)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Offer())
				->setUrl($data->modelData['$.request.url'])
				->setCategory($data->modelData['$.request.category'])
			;

			$file = $data->modelData['$.files.image'];
			if (!empty($file)) {

				$item->setImage(
					(new Upload())
						->setDir('offers')
						->setFile($data->modelData['$.files.image'])
				);
			}

			$view['category'] = $data->inputData['$.get.category'];

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-offer-items', $view);
	}

	/**
	 * @Route("/admin/offer/do-update", name="admin-offer-items-do-update")
	 * @Method("POST")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new OfferTransformer($this->getDoctrine()) ])
			->add('$.request.url', FormField::TYPE_VALUE)
			->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.files.image', FormField::TYPE_OBJECT)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setUrl($data->modelData['$.request.url'])
				->setCategory($data->modelData['$.request.category'])
			;

			$file = $data->modelData['$.files.image'];
			if (!empty($file)) {

				$item->setImage(
					(new Upload())
						->setDir('offers')
						->setFile($data->modelData['$.files.image'])
				);
			}

			$view['category'] = $data->inputData['$.get.category'];

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-offer-items', $view);
	}

	/**
	 * @Route("/admin/offer/do-delete", name="admin-offer-items-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new OfferTransformer($this->getDoctrine()) ])
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$view['category'] = $data->inputData['$.get.category'];

			$em->remove($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-offer-items', $view);
	}
}

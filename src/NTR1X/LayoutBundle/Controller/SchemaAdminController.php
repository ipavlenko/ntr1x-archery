<?php

namespace NTR1X\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

use NTR1X\LayoutBundle\Entity\Schema;
use NTR1X\LayoutBundle\Entity\Domain;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\Widget;
use \NTR1X\LayoutBundle\Entity\Value;

use NTR1X\LayoutBundle\Form\Transformer\SchemaTransformer;

class SchemaAdminController extends Controller
{
	/**
	 * @Route("/admin/layout/schemes", name="admin-layout-schemes")
	 */
	public function itemsAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$view['pages'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Page')
				->findAll(['title'=>'asc'])
			;

			$view['schemes'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Schema')
				->findAll(['name'=>'asc'])
			;

			$view['domains'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Domain')
				->findAll(['name'=>'asc'])
			;

			$view['widgets'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Widget')
				->findAll(['title'=>'asc'])
			;
			
		});

		return $this->render('NTR1XLayoutBundle:private-schemes-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/schemes/create", name="admin-layout-schemes-create")
	 */
	public function createAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$view['form'] = (new FormBuilder())
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.url', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.name' => '',
					'$.request.url' => '',
				])
			;

			$view['pages'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Page')
				->findAll(['title'=>'asc'])
			;

			$view['schemes'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Schema')
				->findAll(['name'=>'asc'])
			;

			$view['domains'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Domain')
				->findAll(['name'=>'asc'])
			;

			$view['widgets'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Widget')
				->findAll(['title'=>'asc'])
			;
			
		});

		return $this->render('NTR1XLayoutBundle:private-schemes-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/schemes/do-create", name="admin-layout-schemes-do-create")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.url', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Schema())
				->setName($data->modelData['$.request.name'])
				->setUrl($data->modelData['$.request.url'])
			;

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-schemes', $view);
	}

	/**
	 * @Route("/admin/layout/schemes/update", name="admin-layout-schemes-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$view['schema'] = $item;

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.url', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.name' => $item->getName(),
					'$.request.url' => $item->getUrl(),
				])
			;

			$this->decorateEditor($view, $data->modelData['$.get.id']);
		});
		
		return $this->render('NTR1XLayoutBundle:private-schemes-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/schemes/do-update", name="admin-layout-schemes-do-update")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.url', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setName($data->modelData['$.request.name'])
				->setUrl($data->modelData['$.request.url'])
			;

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-schemes', $view);
	}

	/**
	 * @Route("/admin/layout/schemes/do-delete", name="admin-layout-schemes-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$em->remove($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-schemes', $view);
	}

	/**
	 * @Route("/admin/layout/schemes/sources", name="admin-layout-schemes-sources")
	 */
	public function sourcesAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];
			$this->decorateEditor($view, $data->modelData['$.get.id']);
			
		});

		return $this->render('NTR1XLayoutBundle:private-schemes-sources.html.twig', $view);
	}

	private function decorateEditor(array &$view, $item) {

		$view['domain'] = $item;

		$view['pages'] = $this
			->getDoctrine()
			->getRepository('NTR1XLayoutBundle:Page')
			->findAll(['title'=>'asc'])
		;

		$view['schemes'] = $this
			->getDoctrine()
			->getRepository('NTR1XLayoutBundle:Schema')
			->findAll(['name'=>'asc'])
		;

		$view['domains'] = $this
			->getDoctrine()
			->getRepository('NTR1XLayoutBundle:Domain')
			->findAll(['name'=>'asc'])
		;

		$view['widgets'] = $this
			->getDoctrine()
			->getRepository('NTR1XLayoutBundle:Widget')
			->findAll(['title'=>'asc'])
		;
	}
}

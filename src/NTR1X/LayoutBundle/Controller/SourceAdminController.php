<?php

namespace NTR1X\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

use NTR1X\LayoutBundle\Entity\Source;
use NTR1X\LayoutBundle\Entity\SourceParam;
use NTR1X\LayoutBundle\Entity\Domain;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\Widget;
use \NTR1X\LayoutBundle\Entity\Value;

use NTR1X\LayoutBundle\Form\Transformer\DomainTransformer;
use NTR1X\LayoutBundle\Form\Transformer\DomainSpecTransformer;

class SourceAdminController extends Controller
{
	/**
	 * @Route("/admin/layout/sources", name="admin-layout-sources")
	 */
	public function itemsAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			// $data = $form->handleRequest($request);

			$view['pages'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Page')
				->findAll(['title'=>'asc'])
			;

			$view['sources'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Source')
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

		return $this->render('NTR1XLayoutBundle:private-sources-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/sources/create", name="admin-layout-sources-create")
	 */
	public function createAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			// $data = $form->handleRequest($request);

			$view['form'] = (new FormBuilder())
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.spec', FormField::TYPE_VALUE, [ 'transformer' => new DomainSpecTransformer($this->getDoctrine()) ])
				->add('$.request.path', FormField::TYPE_VALUE)
				->add('$.request.method', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.name' => '',
					'$.request.spec' => null,
					'$.request.path' => '',
					'$.request.method' => '',
				])
			;

			$view['pages'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Page')
				->findAll(['title'=>'asc'])
			;

			$view['sources'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Source')
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

		return $this->render('NTR1XLayoutBundle:private-sources-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/sources/do-create", name="admin-layout-sources-do-create")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.spec', FormField::TYPE_VALUE, [ 'transformer' => new DomainSpecTransformer($this->getDoctrine()) ])
			->add('$.request.path', FormField::TYPE_VALUE)
			->add('$.request.method', FormField::TYPE_VALUE)
			->add('$.request.params.*', FormField::TYPE_ARRAY, [ 'transformer' => new DomainSpecTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Source())
				->setName($data->modelData['$.request.name'])
				->setSpec($data->modelData['$.request.spec'])
				->setPath($data->modelData['$.request.path'])
				->setMethod($data->modelData['$.request.method'])
			;

			foreach ($data->modelData['$.request.params.*'] as $param) {

				$value = (new Value())
					->setValue($param['value']['value'])
					->setBinding($param['value']['binding'])
				;

				$param = (new SourceParam())
					->setName($param['name'])
					->setIn($param['in'])
					->setRequired($param['required'])
					->setType($param['type'])
					->setValue($value)
				;

				$item->addParam($param);
			}

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-sources', $view);
	}

	/**
	 * @Route("/admin/layout/sources/update", name="admin-layout-sources-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.spec', FormField::TYPE_VALUE, [ 'transformer' => new DomainSpecTransformer($this->getDoctrine()) ])
				->add('$.request.path', FormField::TYPE_VALUE)
				->add('$.request.method', FormField::TYPE_VALUE)
				->add('$.request.params.*', FormField::TYPE_ARRAY, [ 'transformer' => new DomainSpecTransformer($this->getDoctrine()) ])
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.name' => $item->getName(),
					'$.request.spec' => $item->getSpec(),
					'$.request.path' => $item->getPath(),
					'$.request.method' => $item->getMethod(),
					'$.request.params.*' => $item->getParams(),
				])
			;

			$view['specs'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:DomainSpec')
				->findAll(['name'=>'asc'])
			;

			$this->decorateEditor($view, $data->modelData['$.get.id']);
		});
		
		return $this->render('NTR1XLayoutBundle:private-sources-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/sources/do-update", name="admin-layout-sources-do-update")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.spec', FormField::TYPE_VALUE, [ 'transformer' => new DomainSpecTransformer($this->getDoctrine()) ])
			->add('$.request.path', FormField::TYPE_VALUE)
			->add('$.request.method', FormField::TYPE_VALUE)
			->add('$.request.params.*', FormField::TYPE_ARRAY)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setName($param['name'])
				->setIn($param['in'])
				->setRequired($param['required'])
				->setType($param['type'])
				->setValue($value)
			;

			foreach ($item->getParams() as $param) {
				$item->removeParam($param);
			}

			foreach ($data->modelData['$.request.params.*'] as $param) {

				$value = (new Value())
					->setValue($param['value']['value'])
					->setBinding($param['value']['binding'])
				;

				$param = (new SourceParam())
					->setName($param['name'])
					->setIn($param['in'])
					->setRequired($param['required'])
					->setType($param['type'])
					->setValue($value)
				;

				$item->addParam($param);
			}

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-sources', $view);
	}

	/**
	 * @Route("/admin/layout/sources/do-delete", name="admin-layout-sources-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
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
		
		return $this->redirectToRoute('admin-layout-sources', $view);
	}

	private function decorateEditor(array &$view, $item) {

		$view['source'] = $item;

		$view['pages'] = $this
			->getDoctrine()
			->getRepository('NTR1XLayoutBundle:Page')
			->findAll(['title'=>'asc'])
		;

		$view['sources'] = $this
			->getDoctrine()
			->getRepository('NTR1XLayoutBundle:Source')
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

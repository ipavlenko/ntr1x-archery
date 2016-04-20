<?php

namespace NTR1X\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

use NTR1X\LayoutBundle\Entity\Domain;
use NTR1X\LayoutBundle\Entity\DomainSetting;
use NTR1X\LayoutBundle\Entity\DomainSpec;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\Widget;

use NTR1X\LayoutBundle\Form\Transformer\DomainTransformer;

class DomainAdminController extends Controller
{
	/**
	 * @Route("/admin/layout/domains", name="admin-layout-domains")
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

		return $this->render('NTR1XLayoutBundle:private-domains-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/domains/create", name="admin-layout-domains-create")
	 */
	public function createAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			// $data = $form->handleRequest($request);

			$view['form'] = (new FormBuilder())
				->add('$.request.name', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.name' => '',
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

		return $this->render('NTR1XLayoutBundle:private-domains-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/domains/do-create", name="admin-layout-domains-do-create")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.name', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Domain())
				->setName($data->modelData['$.request.name'])
			;

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-domains', $view);
	}

	/**
	 * @Route("/admin/layout/domains/update", name="admin-layout-domains-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new DomainTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new DomainTransformer($this->getDoctrine()) ])
				->add('$.request.name', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.name' => $item->getName(),
				])
			;

			$this->decorateEditor($view, $data->modelData['$.get.id']);
		});
		
		return $this->render('NTR1XLayoutBundle:private-domains-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/domains/do-update", name="admin-layout-domains-do-update")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new DomainTransformer($this->getDoctrine()) ])
			->add('$.request.name', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setName($data->modelData['$.request.name'])
			;

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-domains', $view);
	}

	/**
	 * @Route("/admin/layout/domains/do-delete", name="admin-layout-domains-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new DomainTransformer($this->getDoctrine()) ])
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
		
		return $this->redirectToRoute('admin-layout-domains', $view);
	}

	/**
	 * @Route("/admin/layout/domains/settings", name="admin-layout-domains-settings")
	 */
	public function settingsAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new DomainTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);
			$this->decorateEditor($view, $data->modelData['$.get.id']);
			
		});

		return $this->render('NTR1XLayoutBundle:private-domains-settings.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/domains/settings/do-update", name="admin-layout-domains-settings-do-update")
	 */
	public function settingsDoUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new DomainTransformer($this->getDoctrine()) ])
			->add('$.request.settings.*', FormField::TYPE_ARRAY)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id'];

			foreach ($item->getSettings() as $setting) {

				$item->removeSetting($setting);
			}

			foreach ($data->modelData['$.request.settings.*'] as $setting) {

				$item->addSetting(
					(new DomainSetting())
						->setDomain($item)
						->setKey($setting['key'])
						->setValue($setting['value'])
				);
			}

			$view['id'] = $item->getId();

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-domains-settings', $view);
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

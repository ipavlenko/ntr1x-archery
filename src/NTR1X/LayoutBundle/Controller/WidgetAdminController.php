<?php

namespace NTR1X\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

use NTR1X\LayoutBundle\Entity\Domain;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\Widget;

use NTR1X\LayoutBundle\Form\Transformer\WidgetTransformer;

class WidgetAdminController extends Controller
{
	/**
	 * @Route("/admin/layout/widgets", name="admin-layout-widgets")
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
                ->get('ntr1_x_layout.widget.manager')
                ->getWidgets()
            ;

			/*$view['widgets'] = $this
				->getDoctrine()
				->getRepository('NTR1XLayoutBundle:Widget')
				->findAll(['title'=>'asc'])
			;*/
			
		});

		return $this->render('NTR1XLayoutBundle:private-widgets-list.html.twig', $view);
	}

    /**
     * @Route("/admin/layout/widgets/preview", name="admin-layout-widgets-preview")
     */
    public function previewAction(Request $request) {

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
                ->get('ntr1_x_layout.widget.manager')
                ->getWidgets()
            ;
            
            $view['item'] = $request->query->all();

        });

        return $this->render('NTR1XLayoutBundle:private-widgets-preview.html.twig', $view);
    }

	/**
	 * @Route("/admin/layout/widgets/create", name="admin-layout-widgets-create")
	 */
	public function createAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			// $data = $form->handleRequest($request);

			$view['form'] = (new FormBuilder())
				->add('$.request.type', FormField::TYPE_VALUE)
				->add('$.request.name', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.type' => '',
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

		return $this->render('NTR1XLayoutBundle:private-widgets-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/widgets/do-create", name="admin-layout-widgets-do-create")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.type', FormField::TYPE_VALUE)
			->add('$.request.name', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Widget())
				->setType($data->modelData['$.request.type'])
				->setName($data->modelData['$.request.name'])
			;

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-widgets', $view);
	}

	/**
	 * @Route("/admin/layout/widgets/update", name="admin-layout-widgets-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new WidgetTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new WidgetTransformer($this->getDoctrine()) ])
				->add('$.request.type', FormField::TYPE_VALUE)
				->add('$.request.name', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.type' => $item->getType(),
					'$.request.name' => $item->getName(),
				])
			;

			$this->decorateEditor($view, $data->modelData['$.get.id']);
		});
		
		return $this->render('NTR1XLayoutBundle:private-widgets-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/widgets/do-update", name="admin-layout-widgets-do-update")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new WidgetTransformer($this->getDoctrine()) ])
			->add('$.request.type', FormField::TYPE_VALUE)
			->add('$.request.name', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setType($data->modelData['$.request.type'])
				->setName($data->modelData['$.request.name'])
			;

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-widgets', $view);
	}

	/**
	 * @Route("/admin/layout/widgets/do-delete", name="admin-layout-widgets-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new WidgetTransformer($this->getDoctrine()) ])
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
		
		return $this->redirectToRoute('admin-layout-widgets', $view);
	}

	/**
	 * @Route("/admin/layout/widgets/settings", name="admin-layout-widgets-settings")
	 */
	public function settingsAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new WidgetTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);
			$this->decorateEditor($view, $data->modelData['$.get.id']);
			
		});

		return $this->render('NTR1XLayoutBundle:private-widgets-settings.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/widgets/settings/do-update", name="admin-layout-widgets-settings-do-update")
	 */
	public function settingsDoUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new WidgetTransformer($this->getDoctrine()) ])
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
					(new WidgetSetting())
						->setDomain($item)
						->setKey($setting['key'])
						->setValue($setting['value'])
				);
			}

			$view['id'] = $item->getId();

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-layout-widgets-settings', $view);
	}

	private function decorateEditor(array &$view, $item) {

		$view['widget'] = $item;

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

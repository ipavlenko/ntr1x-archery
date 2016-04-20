<?php

namespace NTR1X\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

use NTR1X\FormBundle\Form\FormBuilder;
use NTR1X\FormBundle\Form\FormField;

use NTR1X\LayoutBundle\Entity\Domain;
use NTR1X\LayoutBundle\Entity\Source;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\PageSetting;
use NTR1X\LayoutBundle\Entity\PageMeta;
use NTR1X\LayoutBundle\Entity\Widget;

use NTR1X\LayoutBundle\Form\Transformer\PageTransformer;
use NTR1X\LayoutBundle\Form\Transformer\SchemaTransformer;
use NTR1X\LayoutBundle\Form\Transformer\SourceTransformer;

class PageAdminController extends Controller
{
	/**
	 * @Route("/admin/layout/pages", name="admin-layout-pages")
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

		return $this->render('NTR1XLayoutBundle:private-pages-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/create", name="admin-layout-pages-create")
	 */
	public function createAction(Request $request) {

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			// $data = $form->handleRequest($request);

			$view['form'] = (new FormBuilder())
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.title', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.name' => '',
					'$.request.title' => '',
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

		return $this->render('NTR1XLayoutBundle:private-pages-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/do-create", name="admin-layout-pages-do-create")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.title', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Page())
				->setName($data->modelData['$.request.name'])
				->setTitle($data->modelData['$.request.title'])
			;

			$em->persist($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages', $view);
	}

	/**
	 * @Route("/admin/layout/pages/update", name="admin-layout-pages-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];
			$this->decorateEditor($view, $item);

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.title', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.name' => $item->getName(),
					'$.request.title' => $item->getTitle(),
				])
			;
		});

		return $this->render('NTR1XLayoutBundle:private-pages-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/do-update", name="admin-layout-pages-do-update")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.title', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setName($data->modelData['$.request.name'])
				->setTitle($data->modelData['$.request.title'])
			;

			$em->persist($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages', $view);
	}

	/**
	 * @Route("/admin/layout/pages/do-delete", name="admin-layout-pages-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
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

		return $this->redirectToRoute('admin-layout-pages', $view);
	}

	/**
	 * @Route("/admin/layout/pages/metas", name="admin-layout-pages-metas")
	 */
	public function metasAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];
			$this->decorateEditor($view, $data->modelData['$.get.id']);

		});

		return $this->render('NTR1XLayoutBundle:private-pages-metas.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/settings", name="admin-layout-pages-settings")
	 */
	public function settingsAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];
			$this->decorateEditor($view, $data->modelData['$.get.id']);

		});

		return $this->render('NTR1XLayoutBundle:private-pages-settings.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/refs", name="admin-layout-pages-refs")
	 */
	public function refsAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];
			$this->decorateEditor($view, $data->modelData['$.get.id']);

		});

		return $this->render('NTR1XLayoutBundle:private-pages-refs.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/sources", name="admin-layout-pages-sources")
	 */
	public function sourcesAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$page = $data->modelData['$.get.id'];
			$this->decorateEditor($view, $page);

		});

		return $this->render('NTR1XLayoutBundle:private-pages-sources-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/sources/create", name="admin-layout-pages-sources-create")
	 */
	public function sourcesCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$page = $data->modelData['$.get.page'];
			$this->decorateEditor($view, $page);

			$view['form'] = (new FormBuilder())
				->add('$.request.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
				->add('$.request.name', FormField::TYPE_VALUE)
				->add('$.request.schema', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
				->add('$.request.path', FormField::TYPE_VALUE)
				->add('$.request.method', FormField::TYPE_VALUE)
				->build()
				->createView([
					'$.request.page' => $page,
					'$.request.name' => '',
					'$.request.schema' => null,
					'$.request.path' => '',
					'$.request.method' => 'GET',
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

		return $this->render('NTR1XLayoutBundle:private-pages-sources-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/sources/update", name="admin-layout-pages-sources-update")
	 */
	public function sourcesUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$page = $data->modelData['$.get.page'];
			$item = $data->modelData['$.get.id'];

			$this->decorateEditor($view, $page);

			$view['source'] = $item;

			// $view['form'] = (new FormBuilder())
			// 	->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
			// 	->add('$.request.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			// 	->add('$.request.name', FormField::TYPE_VALUE)
			// 	->add('$.request.schema', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			// 	->add('$.request.path', FormField::TYPE_VALUE)
			// 	->add('$.request.method', FormField::TYPE_VALUE)
			// 	->build()
			// 	->createView([
			// 		'$.request.id' => $item,
			// 		'$.request.page' => $page,
			// 		'$.request.name' => $item->getName(),
			// 		'$.request.schema' => $item->getSchema(),
			// 		'$.request.path' => $item->getPath(),
			// 		'$.request.method' => $item->getMethod(),
			// 	])
			// ;
		});

		return $this->render('NTR1XLayoutBundle:private-pages-sources-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/layout/pages/sources/do-create", name="admin-layout-pages-sources-do-create")
	 */
	public function sourcesDoCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.schema', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			->add('$.request.path', FormField::TYPE_VALUE)
			->add('$.request.method', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Source())
				->setPage($data->modelData['$.request.page'])
				->setName($data->modelData['$.request.name'])
				->setSchema($data->modelData['$.request.schema'])
				->setPath($data->modelData['$.request.path'])
				->setMethod($data->modelData['$.request.method'])
			;

			$view['id'] = $item->getPage()->getId();

			$em->persist($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages-sources', $view);
	}

	/**
	 * @Route("/admin/layout/pages/sources/do-update", name="admin-layout-pages-sources-do-update")
	 */
	public function sourcesDoUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
			->add('$.request.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->add('$.request.name', FormField::TYPE_VALUE)
			->add('$.request.schema', FormField::TYPE_VALUE, [ 'transformer' => new SchemaTransformer($this->getDoctrine()) ])
			->add('$.request.path', FormField::TYPE_VALUE)
			->add('$.request.method', FormField::TYPE_VALUE)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$page = $data->modelData['$.request.page'];
			$item = $data->modelData['$.request.id']
				->setName($data->modelData['$.request.name'])
				->setSchema($data->modelData['$.request.schema'])
				->setPath($data->modelData['$.request.path'])
				->setMethod($data->modelData['$.request.method'])
			;

			$view['id'] = $page->getId();

			$em->persist($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages-sources', $view);
	}

	/**
	 * @Route("/admin/layout/pages/sources/do-delete", name="admin-layout-pages-sources-do-delete")
	 */
	public function sourcesDoDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.page', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new SourceTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$page = $data->modelData['$.get.page'];;
			$item = $data->modelData['$.get.id'];

			$view['id'] = $page->getId();

			$em->remove($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages-sources', $view);
	}

	/**
	 * @Route("/admin/layout/pages/metas/do-update", name="admin-layout-pages-metas-do-update")
	 */
	public function metasDoUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
			->add('$.request.metas.*', FormField::TYPE_ARRAY)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id'];

			foreach ($item->getMetas() as $meta) {

				$item->removeMeta($meta);
			}

			foreach ($data->modelData['$.request.metas.*'] as $meta) {

				$item->addMeta(
					(new PageMeta())
						->setPage($item)
						->setName($meta['name'])
						->setContent($meta['content'])
				);
			}

			$view['id'] = $item->getId();

			$em->persist($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages-metas', $view);
	}

	/**
	 * @Route("/admin/layout/pages/settings/do-update", name="admin-layout-pages-settings-do-update")
	 */
	public function settingsDoUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new PageTransformer($this->getDoctrine()) ])
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
					(new PageSetting())
						->setPage($item)
						->setKey($setting['key'])
						->setValue($setting['value'])
				);
			}

			$view['id'] = $item->getId();

			$em->persist($item);
			$em->flush();
		});

		return $this->redirectToRoute('admin-layout-pages-settings', $view);
	}

	private function decorateEditor(array &$view, $item) {

		$view['page'] = $item;

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

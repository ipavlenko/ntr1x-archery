<?php

namespace NTR1X\MediaBundle\Controller;

use NTR1X\MediaBundle\Entity\Media;
use NTR1X\MediaBundle\Entity\Tag;
use NTR1X\MediaBundle\Form\MediaFormFactory;
use NTR1X\MediaBundle\Form\Transformer\CategoryTransformer;
use NTR1X\MediaBundle\Form\Transformer\MediaTransformer;
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

class MediaAdminController extends Controller {

	/**
	 * @Route("/admin/media/i", name="admin-media-items")
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
				->getRepository('NTR1XMediaBundle:Category')
				->findAll(['title'=>'asc'])
			;
			$view['items'] = $view['category'] == null
				? $this
					->getDoctrine()
					->getRepository('NTR1XMediaBundle:Media')
					->findAll(['published'=>'desc'])
				: $this
					->getDoctrine()
					->getRepository('NTR1XMediaBundle:Media')
					->findBy(['category' => $view['category']], ['published'=>'desc'])
			;
		});

		return $this->render('NTR1XMediaBundle:private-media-list.html.twig', $view);
	}

	/**
	 * @Route("/admin/media/update", name="admin-media-items-update")
	 */
	public function updateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new MediaTransformer($this->getDoctrine()) ])
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.get.id'];

			$tags = [];
			foreach ($item->getTags() as $tag) {
				$tags[] = $tag->getName();
			}

			$view['form'] = (new FormBuilder())
				->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new MediaTransformer($this->getDoctrine()) ])
				->add('$.request.tags', FormField::TYPE_VALUE, [ 'transformer' => new ImplodeTransformer() ])
				->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
				->add('$.request.published', FormField::TYPE_VALUE, [ 'transformer' => new DateTimeTransformer() ])
				->add('$.request.title', FormField::TYPE_VALUE)
				->add('$.request.video', FormField::TYPE_VALUE)
				->add('$.request.promo', FormField::TYPE_VALUE)
				->add('$.request.description', FormField::TYPE_VALUE)
				->add('$.files.thumbnail', FormField::TYPE_OBJECT)
				->build()
				->createView([
					'$.request.id' => $item,
					'$.request.tags' => $tags,
					'$.request.category' => $item->getCategory(),
					'$.request.published' => $item->getPublished(),
					'$.request.title' => $item->getTitle(),
					'$.request.video' => $item->getVideo(),
					'$.request.promo' => $item->getPromo(),
					'$.request.description' => $item->getDescription(),
					'$.files.thumbnail' => $item->getThumbnail(),
				])
			;

			$view['category'] = $data->modelData['$.get.category'];
			$view['categories'] = $this
				->getDoctrine()
				->getRepository('NTR1XMediaBundle:Category')
				->findAll(['title'=>'asc'])
			;
		});
		
		return $this->render('NTR1XMediaBundle:private-media-update.html.twig', $view);
	}

	/**
	 * @Route("/admin/media/create", name="admin-media-items-create")
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
				->add('$.request.tags', FormField::TYPE_VALUE, [ 'transformer' => new ImplodeTransformer() ])
				->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
				->add('$.request.published', FormField::TYPE_VALUE, [ 'transformer' => new DateTimeTransformer() ])
				->add('$.request.title', FormField::TYPE_VALUE)
				->add('$.request.video', FormField::TYPE_VALUE)
				->add('$.request.promo', FormField::TYPE_VALUE)
				->add('$.request.description', FormField::TYPE_VALUE)
				->add('$.files.thumbnail', FormField::TYPE_OBJECT)
				->build()
				->createView([
					'$.request.tags' => [],
					'$.request.category' => $data->modelData['$.get.category'],
					'$.request.published' => new \DateTime(),
					'$.request.title' => '',
					'$.request.video' => '',
					'$.request.promo' => '',
					'$.request.description' => '',
					'$.files.thumbnail' => null,
				])
			;

			$view['category'] = $data->modelData['$.get.category'];
			$view['categories'] = $this
				->getDoctrine()
				->getRepository('NTR1XMediaBundle:Category')
				->findAll(['title'=>'asc'])
			;
		});
		
		return $this->render('NTR1XMediaBundle:private-media-create.html.twig', $view);
	}

	/**
	 * @Route("/admin/media/do-create", name="admin-media-items-do-create")
	 * @Method("POST")
	 */
	public function doCreateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.request.title', FormField::TYPE_VALUE)
			->add('$.request.video', FormField::TYPE_VALUE)
			->add('$.request.tags', FormField::TYPE_VALUE, [ 'transformer' => new ImplodeTransformer() ])
			->add('$.request.promo', FormField::TYPE_VALUE)
			->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.request.description', FormField::TYPE_VALUE)
			->add('$.request.published', FormField::TYPE_VALUE, [ 'transformer' => new DateTimeTransformer() ])
			->add('$.files.thumbnail', FormField::TYPE_OBJECT)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = (new Media())
				->setTitle($data->modelData['$.request.title'])
				->setVideo($data->modelData['$.request.video'])
				->setPromo($data->modelData['$.request.promo'])
				->setDescription($data->modelData['$.request.description'])
				->setPublished($data->modelData['$.request.published'])
				->setCategory($data->modelData['$.request.category'])
			;

			$file = $data->modelData['$.files.thumbnail'];
			if (!empty($file)) {

				$item->setThumbnail(
					(new Upload())
						->setDir('media/thumbnails')
						->setFile($data->modelData['$.files.thumbnail'])
				);
			}

			$em->persist($item);
			$em->flush();

			foreach ($data->modelData['$.request.tags'] as $name) {

				$tag = (new Tag())
					->setName($name)
					->setItem($item)
				;

				$em->persist($tag);
			}

			$item->setSearch(
				(new Search())
					->setType($item->getCategory()->getName())
					->setUrl('http://solr.burmatov.com')
					->setCollection('collection_dist_ru')
					->setData([
						'url' => "/media/i/{$item->getId()}",
						'date' => $item->getPublished()->format('Y-m-d'),
						'title' => $item->getTitle(),
						'promo' => $item->getPromo(),
						'content' => $item->getDescription(),
						'tags' => $data->modelData['$.request.tags'],
					])
			);

			$view['category'] = $data->inputData['$.get.category'];

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-media-items', $view);
	}

	/**
	 * @Route("/admin/media/do-update", name="admin-media-items-do-update")
	 * @Method("POST")
	 */
	public function doUpdateAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.request.id', FormField::TYPE_VALUE, [ 'transformer' => new MediaTransformer($this->getDoctrine()) ])
			->add('$.request.title', FormField::TYPE_VALUE)
			->add('$.request.video', FormField::TYPE_VALUE)
			->add('$.request.tags', FormField::TYPE_VALUE, [ 'transformer' => new ImplodeTransformer() ])
			->add('$.request.promo', FormField::TYPE_VALUE)
			->add('$.request.category', FormField::TYPE_VALUE, [ 'transformer' => new CategoryTransformer($this->getDoctrine()) ])
			->add('$.request.description', FormField::TYPE_VALUE)
			->add('$.request.published', FormField::TYPE_VALUE, [ 'transformer' => new DateTimeTransformer() ])
			->add('$.files.thumbnail', FormField::TYPE_OBJECT)
			->build()
		;

		$view = [];

		$em = $this->getDoctrine()->getManager();

		$em->getConnection()->transactional(function($conn) use (&$em, &$request, &$form, &$view) {

			$data = $form->handleRequest($request);

			$item = $data->modelData['$.request.id']
				->setTitle($data->modelData['$.request.title'])
				->setVideo($data->modelData['$.request.video'])
				->setPromo($data->modelData['$.request.promo'])
				->setDescription($data->modelData['$.request.description'])
				->setPublished($data->modelData['$.request.published'])
				->setCategory($data->modelData['$.request.category'])
			;

			$file = $data->modelData['$.files.thumbnail'];
			if (!empty($file)) {

				$item->setThumbnail(
					(new Upload())
						->setDir('media/thumbnails')
						->setFile($data->modelData['$.files.thumbnail'])
				);
			}

			foreach ($item->getTags() as $tag) {

				$item->removeTag($tag);
			}

			foreach ($data->modelData['$.request.tags'] as $name) {

				$tag = (new Tag())
					->setName($name)
					->setItem($item)
				;

				$em->persist($tag);
			}

			$item->setSearch(
				(new Search())
					->setType($item->getCategory()->getName())
					->setUrl('http://solr.burmatov.com')
					->setCollection('collection_dist_ru')
					->setData([
						'url' => "/media/i/{$item->getId()}",
						'date' => $item->getPublished()->format('Y-m-d'),
						'title' => $item->getTitle(),
						'promo' => $item->getPromo(),
						'content' => $item->getDescription(),
						'tags' => $data->modelData['$.request.tags'],
					])
			);

			$view['category'] = $data->inputData['$.get.category'];

			$em->persist($item);
			$em->flush();
		});
		
		return $this->redirectToRoute('admin-media-items', $view);
	}

	/**
	 * @Route("/admin/media/do-delete", name="admin-media-items-do-delete")
	 */
	public function doDeleteAction(Request $request) {

		$form = (new FormBuilder())
			->add('$.get.id', FormField::TYPE_VALUE, [ 'transformer' => new MediaTransformer($this->getDoctrine()) ])
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
		
		return $this->redirectToRoute('admin-media-items', $view);
	}
}
